import asyncio
import logging
from requests_oauthlib import OAuth2Session


log = logging.getLogger(__name__)


class Github(object):

    AUTH_URL = 'https://github.com/login/oauth/authorize'
    TOKEN_URL = 'https://github.com/login/oauth/access_token'
    SCOPE = 'read:org,repo'

    def __init__(self, key, secret, *, loop=None):
        self._loop = loop or asyncio.get_event_loop()
        self._key = key
        self._secret = secret
        self._sessions = {}

    @property
    def key(self):
        return self._key

    def _clean_state(self, state):
        if state not in self._sessions:
            return
        del self._sessions[state]

    def auth(self):
        """
        Generates an URL (that should be used by the user to authenticate
        himself to Github) and a unique state.
        """
        session = OAuth2Session(self._key, scope=self.SCOPE)
        url, state = session.authorization_url(self.AUTH_URL)
        self._sessions[state] = {'url': url, 'session': session}
        self._loop.call_later(300, self._clean_state, state)
        return url

    def token(self, state, code):
        """
        Allow to request the final token that will be used to perform requests.
        """
        if state not in self._sessions:
            raise ValueError('Unknown OAuth state: {}'.format(state))

        session = self._sessions[state]['session']
        result = session.fetch_token(
            self.TOKEN_URL,
            client_secret=self._secret,
            code=code
        )
        self._clean_state(state)
        return result['access_token']
