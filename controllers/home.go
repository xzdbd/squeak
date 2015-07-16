package controllers
import "github.com/astaxie/beego"

type HomeController struct {
	beego.Controller
}

func (c *HomeController) Get() {
	c.TplNames = "home.tpl"
}