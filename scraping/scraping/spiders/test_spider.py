import scrapy

from . import FirestoreSpider


class TestSpider(FirestoreSpider):
    name = "test_spider"

    def start_requests(self):

        for url in self.next_url():
            yield scrapy.Request(url=url, callback=self.parse)
