package routers

import (
	"github.com/astaxie/beego"
	"github.com/xzdbd/squeak/controllers"
)

func init() {
	beego.Router("/", &controllers.MainController{})
	beego.Router("/pollution", &controllers.PollutionController{})
	beego.Router("/pollution/chart", &controllers.PollutionChartController{})
}
