# from dataclasses import dataclass
from typing import Optional, Dict, List, Tuple
from enum import Enum
# from scraper.utils import get_keccak_256
import bs4
from snscrape.modules.twitter import TwitterTweetScraper
import requests
import time

from urllib3.util import url as urlutils


class Platforms(Enum):
    twitter = 'twitter'
    mastodon = 'mastodon'


class Scrapper:

    mastodon_url = 'https://mastodon.social/api/v1/statuses/'

    def get_platform(self, url: str) -> Platforms:
        parsed_url = urlutils.parse_url(url)
        if "twitter" in parsed_url.host:
            return Platforms.twitter
        if "mastodon" in parsed_url.host:
            return Platforms.mastodon
        raise ValueError('Unknown source')

    def get_profile_url(self, platform: Platforms, id: str) -> str:
        if Platforms.mastodon == platform:
            return f"https://mastodon.social/@{id}"
        elif Platforms.twitter == platform:
            return f"https://twitter.com/{id}"

    @staticmethod
    def get_id_from_url(url: str) -> str:
        parsed_url = urlutils.parse_url(url)
        return parsed_url.path.split('/')[-1]

    def scrape_tweet(self, url: str) -> Tuple[str, str]:
        tweet_id = Scrapper.get_id_from_url(url)
        tweets = TwitterTweetScraper(tweetId=tweet_id).get_items()
        tweet = next(tweets)
        return tweet.rawContent, self.get_profile_url(Platforms.twitter, tweet.user.username)

    def scrape_toot(self, url: str) -> Tuple[str, str]:
        toot_id = Scrapper.get_id_from_url(url)
        r = requests.get(self.mastodon_url + toot_id)
        if r.status_code != 200:
            raise ValueError("no toot")
        res = r.json()
        soup = bs4.BeautifulSoup(res["content"], "lxml")
        return soup.text, self.get_profile_url(Platforms.mastodon, res["account"]["username"])

    def scrape(self, url: str) -> Tuple[str, str]:
        platform = self.get_platform(url)
        if platform == Platforms.twitter:
            return self.scrape_tweet(url)
        elif platform == Platforms.mastodon:
            return self.scrape_toot(url)

    def scrape_batch(self, urls: List[str]) -> Dict[Tuple[str, str]]:
        data = {}
        for index, url in enumerate(urls):
            try:
                if index > 0 and self.get_platform(urls[index - 1]) == Platforms.mastodon and \
                        self.get_platform(urls[index]) == Platforms.mastodon:
                    time.sleep(1)
                data[url] = self.scrape(url)
            except Exception as e:
                print(e)
                continue
        return data
