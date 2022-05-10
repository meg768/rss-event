#!/usr/bin/env node

let Parser = require('rss-parser');
let Events = require('events');


module.exports = class extends Events {

	constructor(options) {
		super();

		let {debug, interval = 1000 * 60 * 5, log, feeds} = options;

		this.debug = typeof debug == 'function' ? debug : () => {};
		this.log = typeof log == 'function' ? log : () => {};
		this.interval = interval;
		this.parser = new Parser();
		this.timer = undefined;
		this.cache = {};
		this.feeds = feeds;

		this.start();


	}

    async fetchURL(url) {

		this.debug(`Fetching ${url}...`);

		let result = await this.parser.parseURL(url);

		result.items.sort((A, B) => {
			let timeA = new Date(A.isoDate);
			let timeB = new Date(B.isoDate);

			return timeB.getTime() - timeA.getTime();

		});

		let lastItem = result.items[0];
		let title = lastItem.title;
		let link = lastItem.link;
		let content = lastItem.contentSnippet;
		let date = new Date(lastItem.isoDate);

		return {title:title, content:content, link:link, date:date};
    }

	async fetch() {

		try {

			let headlines = [];

			for (let i = 0; i < this.feeds.length; i++) {
				let feed = this.feeds[i];

				try {
					let rss = await this.fetchURL(feed.url);

					if (this.cache[feed.name] == undefined || JSON.stringify(rss) != JSON.stringify(this.cache[feed.name])) {
						headlines.push({name:feed.name, url:feed.url, date:rss.date, title:rss.title, content:rss.content});
						this.cache[feed.name] = rss;
					}
				}
				catch(error) {
					this.log(error);
				}

			}

			headlines.sort((a, b) => {
				return a.date.valueOf() - b.date.valueOf();
			});
			
			for (let headline of headlines) {
				this.emit('headline', headline);

			}

		}
		catch(error) {
			this.log(error);

		}

	}

	start() {

		let loop = async () => {
			try {
				await this.fetch();
			}
			catch (error) {
				this.log(error);
			}
			finally {
				this.debug(`Fetching again in ${this.interval / 1000} seconds...`);
				this.stop();	
				this.timer = setTimeout(loop, this.interval);
			}
		};

		this.stop();

		this.timer = setTimeout(loop, 0);
	}

	stop() {
		if (this.timer != undefined) {
			clearTimeout(this.timer);
			this.timer = undefined;
		}	
	}

}

