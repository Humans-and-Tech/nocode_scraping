# This package will contain the spiders of your Scrapy project
#
# Please refer to the documentation for information on how to create and manage
# your spiders.
import os
import scrapy

from google.cloud import firestore
from google.oauth2 import service_account


class FirestoreSpider(scrapy.Spider):
    def _get_urls(self):
        # TODO
        # Improve the access to firestore-creds.json
        path = os.getcwd()
        credentials = service_account.Credentials.from_service_account_file(
            f"{path}/firestore-creds.json"
        )
        print(f"creds : {path}/firestore-creds.json")
        db = firestore.Client(credentials=credentials)
        coll = db.collection("organizations/test/spiders")
        doc_ref = coll.document("test")
        doc = doc_ref.get()
        if doc.exists:
            print(f"Document data: {doc.to_dict()}")
            urls_collections = doc.to_dict().get("urlsCollections")
            if urls_collections:
                _urls_coll_coll = db.collection("organizations/test/urlscollections")
                for _urls_coll_name in urls_collections:
                    urls_coll_ref = _urls_coll_coll.document(_urls_coll_name)
                    my_urls_collection = urls_coll_ref.get()
                    if my_urls_collection.exists:
                        print(f"my_urls_collection: {my_urls_collection.to_dict()}")
                        return my_urls_collection.to_dict().get("urlsList")

    def start_requests(self):
        print(f"parent start_requests called")

    def next_url(self):
        """
        Generate a list of URLs to crawl. You can query a database or come up with some other means
        Note that if you generate URLs to crawl from a scraped URL then you're better of using a
        LinkExtractor instead: http://doc.scrapy.org/topics/link-extractors.html
        """
        list_of_urls = self._get_urls()

        for next_url in list_of_urls:
            yield next_url

    def parse(self, response):
        print(f"do some stuff with {response}")
        pass
