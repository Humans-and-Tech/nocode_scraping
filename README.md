# Izzy Scraping

## Backend installation

Install a file called `firestore-creds.json` at the root of the backend directory which contains the Google cloud service account credentials

```console

nocode_scraping git:(master) cd backend
backend git:(master) yarn install

```

## Frontend installation

```console

nocode_scraping git:(master) cd frontend
backend git:(master) yarn install

```

## Backend Startup

```console

# make sure to have a file name
#

nocode_scraping git:(master) cd backend
backend git:(master) yarn start

```

## Frontend Startup

```console

nocode_scraping git:(master) cd frontend
backend git:(master) yarn start

```

## Scraping

Install a file called `firestore-creds.json` at the root of the `scraping` directory which contains the Google cloud service account credentials

```console

# make sure you are running a python 3.9+
pip install -r requirements.txt

# launch your spider
scrapy crawl test_spider

```
