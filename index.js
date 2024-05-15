/*
@Filename	:	index.js
@Created 	:	2024/05/14
@Updated	:	2024/05/15
@Author  	:	goonhope@gmail.com;Teddy;Zhuhai
@Function	:	获取微信公众号信息
@Reference	:	node.js -> add  "type": "module"  to package.json file
*/
import fetch from "node-fetch";
import xlsx from "node-xlsx";
import fs from "fs";
import { JSDOM } from "jsdom";
import fire from 'js-fire'

var fnow = (now=0,i=1,a=8)=>{ 
	var nnow =  new Date((now || Date.now()) + a * 3600 * 1000) ;
	return i ? nnow.getTime() : nnow.toJSON().substr(0, 19).replace("T"," ")}; 
var strftime = l => l.map((x,i)=>"1".includes(i)?fnow(x *1000, 0):x);
let isType = (obj,type='String') => Object.prototype.toString.call(obj) === `[object ${type}]` // 类型判断
var toList = y => [Object.keys(y[0]), ...y.map(x=>strftime(Object.values(x).filter(i=>isType(i))))];
var deal = x => Object({...x.appmsg_album_info,author:x.author,user_name:x.user_name,biz:x.biz})
var getId = async (url) => await JSDOM.fromURL(url,{runScripts: "dangerously",resources: "usable"}).then(x=>deal(x.window));
var sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

var wechat = async (url='') =>{
	url = url || 'https://mp.weixin.qq.com/s/TpdNq75Qd7hqV0kpKgayAw';
	var hold = [],i=0;
	let base  = "https://mp.weixin.qq.com/mp/appmsgalbum";
	let {size,id,albumId,biz} = await getId(url);
	let p = {"action": "getalbum", "__biz": biz,  "album_id": albumId, 
				"count": "20","is_reverse": "1", "uin": "", "key": "", "pass_ticket": "",
				"wxtoken": "",  "devicetype": "", "clientversion": "",
				"appmsg_token": "", "x5": "0",  "f": "json" };
	while (1){
		url = base + '?' + Object.entries(p).map(x=>x.join('=')).join("&");
		var f = await fetch(url).then(x=>x.json());
		// console.log(f, url);
		hold.push(...f.getalbum_resp.article_list);
		let len = f.getalbum_resp.article_list.length;
		let a = Object({"begin_msgid":f.getalbum_resp.article_list[len - 1].msgid.toString(),"begin_itemidx":"1"});
		p = Object.assign(p, a);
		if(i == Math.ceil(size/20)-1)break;
		i++;
		// sleep(Math.random * 100);};
	return hold;
	};
var toFile = (fdata,name='index.xlsx') =>{
	if(name.toLocaleLowerCase().endsWith('xlsx')){fdata = xlsx.build([{name: 'list', data: fdata}])};
	fs.writeFile(name, fdata, (err) => console.log(...(err?[err,"fail!"]:["done!"])) || process.exit());};
var go = async (url='',csv=true) => {
	var fdata = await wechat(url).then(x=>toList(x)); 
	fdata = csv?toList(fdata).map(x=>x.toString()).join("\n"):fdata;
	toFile(fdata,`index.${csv?'csv':'xlsx'}`);};

fire(go)
// go('',false)
//     .then()
//     .catch()
//     .finally(); 
