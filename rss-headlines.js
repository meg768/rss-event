#!/usr/bin/env node

let Parser = require('rss-parser');
let Events = require('events');


module.exports = class extends Events {

	constructor(options) {
		super();

		let {feeds} = options;

		this.debug = console.log;
		this.log = console.log;
		this.parser = new Parser();
		this.cache = {};
		this.feeds = feeds;

	}

    async fetchURL(url) {

		this.debug(`Fetching ${url}...`);

		let result = await this.parser.parseURL(url);

		result.items.sort((A, B) => {
			let timeA = new Date(A.isoDate);
			let timeB = new Date(B.isoDate);

			return timeB.getTime() - timeA.getTime();

		});

//		console.log(result.items);

		let lastItem = result.items[0];
		let title = lastItem.title;
		let link = lastItem.link;
		let content = lastItem.contentSnippet;
		let date = new Date(lastItem.isoDate);


		return {title:title, content:content, link:link, date:date};
    }

	async fetch() {

		try {

			for (let i = 0; i < this.feeds.length; i++) {
				let feed = this.feeds[i];

				try {
					let rss = await this.fetchURL(feed.url);

					if (this.cache[feed.name] == undefined || JSON.stringify(rss) != JSON.stringify(this.cache[feed.name])) {
						this.emit('rss', {name:feed.name, url:feed.url, time:rss.date, title:rss.title, content:rss.content});
						this.cache[feed.name] = rss;
					}
				}
				catch(error) {
					this.log(error);
				}

			}
	
		}
		catch(error) {
			this.log(error);

		}

	}

	async loop() {
		try {
			await this.fetch();
		}
		catch (error) {
			this.log(error);
		}
		finally {
			setTimeout(this.loop.bind(this), 1000 * 60 * 0.3);
		}
	}


	async monitor() {
		await this.loop();
	}
}

