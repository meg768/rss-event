#!/usr/bin/env node

var Headlines = require('./rss-headlines.js');


class App {

	constructor() {


		let feeds = [
			{"name": "Aftonbladet", "url": "https://rss.aftonbladet.se/rss2/small/pages/sections/senastenytt"},
			{"name": "Dagens Industri", "url": "https://digital.di.se/rss"},
			
			{
				"name": "Google", "url": "https://news.google.com/rss?hl=sv&gl=SE&ceid=SE:sv",
			},
		
			{
				"name": "SvD", "url": "http://www.svd.se/?service=rss"
			},

			{
				"name": "Sveriges Radio", "url": "http://api.sr.se/api/rss/program/83?format=145"
			},

			{
				"name": "Expressen", "url": "https://feeds.expressen.se/nyheter"
			}			

		];

		this.headlines = new Headlines({feeds:feeds});

		this.headlines.on('rss', (rss) => {
			console.log(rss);
		});

		this.headlines.monitor();
	}
}


new App();
