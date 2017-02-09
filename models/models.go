package models

import (
	"time"

	"github.com/astaxie/beego"
	"github.com/astaxie/beego/orm"

	_ "github.com/lib/pq"
)

type MonitorArea struct {
	Id               int
	Name             string              `json:"area"`
	MonitorStation   []*MonitorStation   `orm:"reverse(many)"`
	MonitorPollution []*MonitorPollution `orm:"reverse(many)"`
}

type MonitorStation struct {
	Id               int
	Name             string              `json:"position_name"`
	Code             string              `json:"station_code"`
	MonitorArea      *MonitorArea        `orm:"rel(fk)"`
	MonitorPollution []*MonitorPollution `orm:"reverse(many)"`
}

type MonitorPollution struct {
	Id               int
	Aqi              int32           `json:"aqi"`
	PrimaryPollutant string          `json:"primary_pollutant"`
	So2              float32         `json:"so2"`
	So224h           float32         `json:"so2_24h"`
	No2              float32         `json:"no2"`
	No224h           float32         `json:"no2_24h"`
	Pm10             float32         `json:"pm10"`
	Pm1024h          float32         `json:"pm10_24h"`
	Co               float32         `json:"co2"`
	Co24h            float32         `json:"co2_24h"`
	O3               float32         `json:"o3"`
	O324h            float32         `json:"o3_24h"`
	O38h             float32         `json:"o3_8h"`
	O38h24h          float32         `json:"o3_8h_24h"`
	Pm25             float32         `json:"pm2_5"`
	Pm2524h          float32         `json:"pm2_5_24h"`
	Quality          string          `json:"quality"`
	Time             time.Time       `json:"time_point"`
	MonitorArea      *MonitorArea    `orm:"rel(fk)"`
	MonitorStation   *MonitorStation `orm:"rel(fk)"`
}

func init() {
	//orm.Debug = true
	initDBConnection()
	syncdb()
	syncArea()
	syncStation()
}

func initDBConnection() {
	orm.RegisterDataBase("default", "postgres", beego.AppConfig.String("dbconnection"))
	orm.SetMaxIdleConns("default", 30)
	orm.DefaultTimeLoc = time.UTC
	orm.RegisterModel(new(MonitorArea), new(MonitorStation), new(MonitorPollution))
}

func syncdb() {
	beego.Info("Starting to sync database...")
	err := orm.RunSyncdb("default", false, true)
	if err != nil {
		beego.Error(err)
	}
}

func syncArea() {
	//InitTableArea()
	o := orm.NewOrm()
	monitorArea := new(MonitorArea)
	monitorArea.Id = 1
	monitorArea.Name = "杭州"
	created, id, err := o.ReadOrCreate(monitorArea, "id", "name")
	if err != nil {
		o.Update(monitorArea)
	} else {
		if created {
			beego.Info("Sync Table monitor_area: with id:", id)
		} else {
			beego.Info("Sync Table monitor_area: no change")
		}
	}
}

func syncStation() {
	o := orm.NewOrm()
	count, err := o.QueryTable("monitor_station").Count()
	if err != nil || count <= 0 {
		var stations []MonitorStation
		stationInfos := GetStationInfoByCity("hangzhou")
		monitorArea := new(MonitorArea)
		monitorArea.Id = 1
		monitorArea.Name = "杭州"

		for i := 0; i < len(stationInfos.Stations); i++ {
			monitorStation := MonitorStation{Id: i + 1, Name: stationInfos.Stations[i].StationName, Code: stationInfos.Stations[i].StationCode, MonitorArea: monitorArea}
			stations = append(stations, monitorStation)
		}

		num, err := o.InsertMulti(1, stations)
		if err != nil {
			beego.Error("Failed to sync Table monitor_station:", err)
		}
		beego.Info("Sync Table monitor_station: insert", num, "records")
	} else {
		beego.Info("Sync Table monitor_station: no change")
	}
}

// get latest pollutioon data and insert it into pollution table
func InsertNewPollutionData() (num int64, err error) {
	var monitorPollutions []MonitorPollution
	o := orm.NewOrm()
	pollutions := GetAQIDetailsByCity("hangzhou")
	for i := 0; i < len(pollutions); i++ {
		//TODO use cache
		//query area from db
		monitorArea := new(MonitorArea)
		o.QueryTable(monitorArea).Filter("name", pollutions[i].Area).One(monitorArea)

		//query station from db
		monitorStation := new(MonitorStation)
		o.QueryTable(monitorStation).Filter("code", pollutions[i].StationCode).Filter("name", pollutions[i].StationName).One(monitorStation)

		monitorPollution := MonitorPollution{
			Aqi:              pollutions[i].Aqi,
			PrimaryPollutant: pollutions[i].PrimaryPollutant,
			So2:              pollutions[i].So2,
			So224h:           pollutions[i].So224h,
			No2:              pollutions[i].No2,
			No224h:           pollutions[i].No224h,
			Pm10:             pollutions[i].Pm10,
			Pm1024h:          pollutions[i].Pm1024h,
			Co:               pollutions[i].Co,
			Co24h:            pollutions[i].Co24h,
			O3:               pollutions[i].O3,
			O324h:            pollutions[i].O324h,
			O38h:             pollutions[i].O38h,
			O38h24h:          pollutions[i].O38h24h,
			Pm25:             pollutions[i].Pm25,
			Pm2524h:          pollutions[i].Pm2524h,
			Quality:          pollutions[i].Quality,
			Time:             pollutions[i].Time,
			MonitorArea:      monitorArea,
			MonitorStation:   monitorStation}
		// TODO use cache
		if !o.QueryTable(monitorPollution).Filter("time", monitorPollution.Time).Exist() {
			monitorPollutions = append(monitorPollutions, monitorPollution)
		}
	}
	if len(monitorPollutions) > 0 {
		num, err = o.InsertMulti(len(monitorPollutions), monitorPollutions)
		if err != nil {
			beego.Error("Insert new pollution data into monitor_pollution failed. Error: ", err)
		}
		beego.Info("Insert new pollution data into monitor_pollution succeeded. Num:", num, "Time:", monitorPollutions[0].Time)
	} else {
		beego.Info("No new pollution data")
	}
	return
}

// For test
func InitTableArea() {
	o := orm.NewOrm()
	monitorArea := new(MonitorArea)
	monitorArea.Id = 1
	monitorArea.Name = "杭州"
	created, id, err := o.ReadOrCreate(monitorArea, "id", "name")
	if err != nil {
		o.Update(monitorArea)
	} else {
		if created {
			beego.Info("Sync Table monitor_area: with id:", id)
		} else {
			beego.Info("Sync Table monitor_area: no change")
		}
	}
}

// For test
func InitTableStation() {
	o := orm.NewOrm()
	count, err := o.QueryTable("monitor_station").Count()
	if err != nil || count <= 0 {
		var stations []MonitorStation
		stationInfos := GetStationInfoByCity("hangzhou")
		monitorArea := new(MonitorArea)
		monitorArea.Id = 1
		monitorArea.Name = "杭州"

		for i := 0; i < len(stationInfos.Stations); i++ {
			monitorStation := MonitorStation{Id: i + 1, Name: stationInfos.Stations[i].StationName, Code: stationInfos.Stations[i].StationCode, MonitorArea: monitorArea}
			stations = append(stations, monitorStation)
		}

		num, err := o.InsertMulti(1, stations)
		if err != nil {
			beego.Error("Failed to sync Table monitor_station:", err)
		}
		beego.Info("Sync Table monitor_station: insert", num, "records")
	} else {
		beego.Info("Sync Table monitor_station: no change")
	}
}

func InsertStation() {
	var stations []MonitorStation
	stationInfos := GetStationInfoByCity("hangzhou")
	monitorArea := new(MonitorArea)
	monitorArea.Id = 1
	monitorArea.Name = "杭州"

	for i := 0; i < len(stationInfos.Stations); i++ {
		monitorStation := MonitorStation{Name: stationInfos.Stations[i].StationName, Code: stationInfos.Stations[i].StationCode, MonitorArea: monitorArea}
		stations = append(stations, monitorStation)
	}

	o := orm.NewOrm()
	num, err := o.InsertMulti(1, stations)
	beego.Trace("num: ", num, "err: ", err)
}

func QueryArea() {
	o := orm.NewOrm()
	monitorArea := new(MonitorArea)
	monitorArea.Name = "杭州"
	err := o.QueryTable(monitorArea).Filter("name", "shanghai").One(monitorArea)

	beego.Trace(monitorArea, err)
}

func InsertPollution() {
	var monitorPollutions []MonitorPollution
	o := orm.NewOrm()
	pollutions := GetAQIDetailsByCity("hangzhou")
	for i := 0; i < len(pollutions); i++ {
		//query area from db
		monitorArea := new(MonitorArea)
		o.QueryTable(monitorArea).Filter("name", pollutions[i].Area).One(monitorArea)

		//query station from db
		monitorStation := new(MonitorStation)
		o.QueryTable(monitorStation).Filter("code", pollutions[i].StationCode).Filter("name", pollutions[i].StationName).One(monitorStation)

		monitorPollution := MonitorPollution{
			Aqi:              pollutions[i].Aqi,
			PrimaryPollutant: pollutions[i].PrimaryPollutant,
			So2:              pollutions[i].So2,
			So224h:           pollutions[i].So224h,
			No2:              pollutions[i].No2,
			No224h:           pollutions[i].No224h,
			Pm10:             pollutions[i].Pm10,
			Pm1024h:          pollutions[i].Pm1024h,
			Co:               pollutions[i].Co,
			Co24h:            pollutions[i].Co24h,
			O3:               pollutions[i].O3,
			O324h:            pollutions[i].O324h,
			O38h:             pollutions[i].O38h,
			O38h24h:          pollutions[i].O38h24h,
			Pm25:             pollutions[i].Pm25,
			Pm2524h:          pollutions[i].Pm2524h,
			Quality:          pollutions[i].Quality,
			Time:             pollutions[i].Time,
			MonitorArea:      monitorArea,
			MonitorStation:   monitorStation}
		monitorPollutions = append(monitorPollutions, monitorPollution)
	}
	beego.Trace(monitorPollutions)

	num, err := o.InsertMulti(len(monitorPollutions), monitorPollutions)
	beego.Trace("num: ", num, "err: ", err)
}
