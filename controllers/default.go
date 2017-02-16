package controllers

import (
	"strconv"

	"time"

	"github.com/astaxie/beego"
	"github.com/xzdbd/squeak/models"
)

type MainController struct {
	beego.Controller
}

type PollutionController struct {
	beego.Controller
}

type PollutionChartController struct {
	beego.Controller
}

func (c *MainController) Get() {
	c.TplName = "index.html"
}

func (c *PollutionController) Get() {
	c.TplName = "pollution/index.html"
}

func (c *PollutionChartController) Get() {
	stationId := c.GetString("id")
	id, _ := strconv.Atoi(stationId)
	if stationId != "" {
		now := time.Now()
		lastDay := now.AddDate(0, 0, -1)
		monitorPollutions, err := models.QueryPollutionInfoByStation(id, lastDay, now)
		beego.Trace(now, lastDay, monitorPollutions)
		if err != nil {
			c.Data["json"] = err.Error()
		} else {
			c.Data["json"] = monitorPollutions
		}

	}
	c.ServeJSON()
}
