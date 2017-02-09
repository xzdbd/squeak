package main

import (
	"github.com/astaxie/beego"
	_ "github.com/xzdbd/squeak/routers"
	_ "github.com/xzdbd/squeak/tools"
)

func main() {
	beego.Run()

}
