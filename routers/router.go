package routers

import (
	"github.com/xzdbd/squeak/controllers"
	"github.com/astaxie/beego"
)

func init() {
    beego.Router("/", &controllers.MainController{})
	beego.Router("/m", &controllers.HomeController{})
}
