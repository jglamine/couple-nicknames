import csv
import codecs
import cStringIO
import time
import requests
from bs4 import BeautifulSoup

class UnicodeWriter:
    """
    A CSV writer which will write rows to CSV file "f",
    which is encoded in the given encoding.
    """

    def __init__(self, f, dialect=csv.excel, encoding="utf-8", **kwds):
        # Redirect output to a queue
        self.queue = cStringIO.StringIO()
        self.writer = csv.writer(self.queue, dialect=dialect, **kwds)
        self.stream = f
        self.encoder = codecs.getincrementalencoder(encoding)()

    def writerow(self, row):
        self.writer.writerow([s.encode("utf-8") for s in row])
        # Fetch UTF-8 output from the queue ...
        data = self.queue.getvalue()
        data = data.decode("utf-8")
        # ... and reencode it into the target encoding
        data = self.encoder.encode(data)
        # write to the target stream
        self.stream.write(data)
        # empty queue
        self.queue.truncate(0)

    def writerows(self, rows):
        for row in rows:
            self.writerow(row)

def scrape_pronunciation(name):
    time.sleep(0.5)
    response = requests.get('http://www.behindthename.com/name/' + name)
    if response.status_code != 200:
        print 'Error getting name:', name
        return 'error http'
    soup = BeautifulSoup(response.text)
    if soup.find('h1'):
        response = requests.get('http://www.behindthename.com/name/' + name + '-1')
        if response.status_code != 200:
            return 'Not found'
    soup = BeautifulSoup(response.text)
    tag = soup.find('a', href='/pronunciation.php')
    if tag is None:
        return 'Not found'
    tag = tag.parent
    return [text for text in tag.stripped_strings][0]

def write_pronunciation(name, pronunciation, csv_writer):
    csv_writer.writerow([name, pronunciation])
    print name, pronunciation.encode('utf-8')

def scrape_names(input_filename, output_filename):
    with open(input_filename, 'rb') as csvFile:
        inputReader = csv.reader(csvFile, delimiter='\t')
        with open(output_filename, 'wb') as csv_output_file:
            csv_writer = UnicodeWriter(csv_output_file, delimiter='\t')
            for row in inputReader:
                name = row[0]
                pronunciation = scrape_pronunciation(name)
                write_pronunciation(name, pronunciation, csv_writer)

def main():
    scrape_names('../data/female_names.csv', '../data/female_names_and_syllables.csv')

if __name__ == '__main__':
    main()
