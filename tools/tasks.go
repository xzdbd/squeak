package tools

import (
	"github.com/astaxie/beego"
	"github.com/astaxie/beego/toolbox"
	"github.com/xzdbd/squeak/models"
)

func init() {
	beego.Info("Initializing toolbox...")
	tk1 := toolbox.NewTask("newPollutionData", beego.AppConfig.String("pollutionschedule"), newPollutionDataTask)
	toolbox.AddTask("newPollutionData", tk1)
	toolbox.StartTask()
	beego.Info("Toolbox started")
}

func newPollutionDataTask() error {
	_, err := models.InsertNewPollutionData()
	err = models.UpdateHangzhouPollutionStation()
	return err
}
