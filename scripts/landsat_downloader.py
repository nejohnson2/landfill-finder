import pandas as pd
import json
import subprocess

# http://geologyandpython.com/get-landsat-8.html

def get_RowPath(lat, lng, clouds):
	'''Run landsat search utility to extract sceneID from lat/lng

	Parameters
	----------
	latlng : list,
		Latitude and longitude coordinates

	clouds : int,
		Maximum percentage of cloud cover allowed.  Default is 10.

	Returns
	-------
	sceneID : string,
		Example: LC81660392014196LGN00

	'''

	search = ['--lat', '--lon']
	search.insert(1, str(lat))
	search.insert(3, str(lng))

	command = ['landsat', 'search', '--json', '--cloud', str(clouds), "--end", "january 01 2015"]
	command.extend(search)
	
	output = subprocess.check_output(command)
	
	results = json.loads(output)
	print "Found {} images".format(results['total_returned'])

	return int(results['results'][0]['row']), int(results['results'][0]['path'])

def read_landfill_coords():
	# read scenes in amazon
	s3_scenes = pd.read_csv('http://landsat-pds.s3.amazonaws.com/c1/L8/scene_list.gz', compression='gzip')

	# read known landfill locations
	fname = '/Users/Gioia/Projects/landfill-satellites/data/output/landfills_master.csv'
	data = pd.read_csv(fname)
	
	bulk_list = []
	for ind, line in data.iterrows():
		
		row, path = get_RowPath(lat=line['lat'], lng=line['lng'], clouds=5)
		
		scenes = s3_scenes[(s3_scenes['path'] == path) & 
							(s3_scenes['row'] == row) & 
							(s3_scenes['cloudCover'] <= 5) &
							(~s3_scenes['productId'].str.contains('_T2')) &
							(~s3_scenes['productId'].str.contains('_RT'))]
		
		print ' Found {} images\n'.format(len(scenes))

		scene = scenes.sort_values('cloudCover').iloc[0]
		print type(line)
		print type(scene)
		print bulk_list.append(line.append(scene))
		
		break


if __name__ == '__main__':
	read_landfill_coords()

	# s3_scenes = pd.read_csv('http://landsat-pds.s3.amazonaws.com/c1/L8/scene_list.gz', compression='gzip')
	# # google_scenes = pd.read_csv('https://storage.googleapis.com/gcp-public-data-landsat/index.csv.gz', compression='gzip')

	# print s3_scenes.head()