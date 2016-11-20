import logging
from aiohttp.web import View, json_response as Response, HTTPMovedPermanently

import runtime


log = logging.getLogger(__name__)


class ApiAuth(View):

    async def post(self):
        """
        OAuth signin step 1
        [Backend] Requests authentication URL to Github.
        [Frontend] Redirects the user to the authentication URL.
        """
        log.critical("Requesting OAuth signin URL")
        url = runtime.github.auth()
        return Response({'url': url})

    async def get(self):
        """
        OAuth signin step 2
        [Github] Redirects the user to a callback URL with a code as param.
        [Backend] Handles the callback (rewrite).
        """
        query = self.request.query_string
        return HTTPMovedPermanently('/#/?{}'.format(query))

    async def patch(self):
        """
        OAuth signin step 3
        [Frontend] Uses callback data to request token.
        [Backend] Requests final token.
        [Frontend] Uses token to perform authorized requests to Github.
        """
        data = await self.request.json()
        try:
            code = data['code']
            state = data['state']
            token = runtime.github.token(state, code)
        except (KeyError, ValueError):
            log.critical("Invalid callback received")
            return Response(status=400)

        log.critical("OAuth token '{}' generated".format(token))
        return Response({'token': token})
