import json, os
from tornado import web, ioloop
from bson import json_util
from pymongo import MongoClient, uri_parser


class IndexHandler(web.RequestHandler):
	'''Handle requests on / '''
	def get(self):
		self.render("index.html")

	def post(self, *args):
		'''Receive entries from the client'''
		data = json.loads(self.request.body)
		print data
		self.finish()


class LandfillHandler(web.RequestHandler):
	'''Handle requests on /api/v1/landfills '''

	def get(self):
		'''Send new coordinate to client'''
		
		# -- Gett DB instance
		db = self.settings['db']

		# -- Connect to collection and get one item that is marked 'incomplete'
		coords = db['landfill-finder'].find_one({"complete":0})

		# set header infor
		self.set_header("Access-Control-Allow-Origin", "*")
		self.set_header("Access-Control-Allow-Methods", "GET")
		self.set_header("Contewnt-Type", "application/json")

		data = {'lat': -74.006, 'lon': 41.7128}

		# send json to client
		#self.write(json_util.dumps(coords))
		self.write(data)

def main():
	# Connect to database Database
	try:
		parser = uri_parser.parse_uri(os.environ['MONGODB_URI'])
		db = MongoClient(os.environ['MONGODB_URI'])[parser['database']]	
	except Exception as e:
		print "Unable to connected to database"
		raise e

	settings = {
		"template_path": os.path.join(os.path.dirname(__file__), "templates"),
		"static_path": os.path.join(os.path.dirname(__file__), "static"),
		"db" : db,
		"debug" : True
	}

	app = web.Application(
		[
			(r'/', IndexHandler),
			(r'/api/v1/landfills', LandfillHandler),
		], **settings
	)

	port = int(os.environ.get("PORT", 5000))
	print "Listening on port: %s"%(port)
	app.listen(port)
	ioloop.IOLoop.instance().start()

if __name__ == '__main__':
	main()		