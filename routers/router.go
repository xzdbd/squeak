package routers

import (
	"github.com/astaxie/beego"
	"github.com/xzdbd/squeak/controllers"
)

func init() {
	beego.Router("/", &controllers.MainController{})
	beego.Router("/m", &controllers.HomeController{})
	beego.Router("/s", &controllers.SemanticController{})
}
