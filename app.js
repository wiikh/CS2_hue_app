http = require('http');
fs = require('fs');
const axios = require('axios');

serverport = 3005;
host = '127.0.0.1';

const url1 = 'http://192.168.1.4/api/6X6SKo8aE1O7VU8LU4Ss-6JOTGOo5-aQ1kmguIiR/lights/10/state';
const url2 = 'http://192.168.1.4/api/6X6SKo8aE1O7VU8LU4Ss-6JOTGOo5-aQ1kmguIiR/lights/9/state';


const freezeTime = async () => {
    await axios.put(url1, {
        on: true,
        sat: 50,
        bri: 254,
        hue: 10000,
        transitiontime: 0
    })
    await axios.put(url2, {
        on: true,
        sat: 50,
        bri: 254,
        hue: 10000,
        transitiontime: 0
    })
}

const roundLive = async () => {
    axios.put(url1, {
        sat: 254,
        bri: 200,
        hue: 45000,
        transitiontime: 30
    });
    axios.put(url2, {
        sat: 254,
        bri: 200,
        hue: 45000,
        transitiontime: 30
    });
}

const bombPlanted = async () => {
    axios.put(url1, {
        hue: 500,
        transitiontime: 0
    });
    axios.put(url2, {
        hue: 500,
        transitiontime: 0
    });
}

const roundOver = async(data) => {
    if(data=='CT')
        axios.put(url1, {
            sat: 200,
            bri: 254,
            hue: 38000,
            transitiontime: 0
    }),
        axios.put(url2, {
            sat: 200,
            bri: 254,
            hue: 38000,
            transitiontime: 0
    });
	else
        axios.put(url1, {
            sat: 200,
            bri: 254,
            hue: 10000,
            transitiontime: 0
    }),
        axios.put(url2, {
            sat: 200,
            bri: 254,
            hue: 10000,
            transitiontime: 0
    });
}


server = http.createServer( function(req, res) 
{
    if (req.method == 'POST') 
	{
        res.writeHead(200, {'Content-Type': 'text/html'});
        var body = '';
        req.on('data', function (data) 
		{
            body += data;
        });
        req.on('end', async function () 
		{
            //console.log("POST payload: " + body);	//uncomment this line if you want to see the JSON message
        	res.end( '' );
			
			if (res.statusCode === 200)
			{
				try 	//we better pack the entire thing in a try statement or the server might crash...
				{
					var data = JSON.parse(body);	//deserialize the JSON contents
					
					// data is available here:
					console.log(data.round.phase);	//print the phase to the screen
					if(data.round.phase=='freezetime')
					{
						await freezeTime()
					}
					if(data.round.phase=='live')
					{
                        if(data.round.bomb==undefined)
                        {
						await roundLive()
                        }
					}
					if(data.round.phase=='over')
					{
						console.log(data.round.win_team);
                        await roundOver(data.round.win_team)
						
					}					
					
					//this is only valid if the JSON contains information about the bomb
					if(data.round.bomb!=undefined)
					{
						console.log(data.round.bomb);	//better print it for clarity
						bombPlanted()
					}
					
				} catch (e) 
				{
					console.log('Error parsing JSON!');
				}
			}				
        });
    }
    else
    {
        console.log("Not expecting other request types...");
        res.writeHead(200, {'Content-Type': 'text/html'});
		var html = '&lt;html>&lt;body>HTTP Server at http://' + host + ':' + serverport + '&lt;/body>&lt;/html>';
        res.end(html);
    }
});
 
server.listen(serverport, host);
console.log('Listening at http://' + host + ':' + serverport);