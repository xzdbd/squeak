package controllers

import "github.com/astaxie/beego"

type HomeController struct {
	beego.Controller
}

type SemanticController struct {
	beego.Controller
}

func (c *HomeController) Get() {
	c.TplNames = "home.tpl"
}

func (c *SemanticController) Get() {
	id := c.GetString("id")
	beego.BeeLogger.Debug(id)
	c.TplNames = "s.tpl"
}
