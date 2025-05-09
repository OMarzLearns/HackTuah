// Main File to call other files
const { GoogleGenerativeAI } = require('@google/generative-ai');
const spotifyPreviewFinder = require('spotify-preview-finder');
const axios = require('axios');
const readline = require('readline'); 
const { stringify } = require('querystring');
const fs = require('fs');

// Login page passes global auth token 
const API_KEY = 'AIzaSyDmxPwZnct2FbUlq_9td9Ucd1HEpMfz29k';
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
require('dotenv').config();

// Spotify API Credentials
async function getCreds(){
    const CLIENT_ID = "0c16c345ac5f48c4a0d73d56239855a3";
    const CLIENT_SECRET = await getInput("What is the key?: ");
    console.log(`You entered: ${CLIENT_SECRET}`);
    if (CLIENT_SECRET == 0) {
        return 0;
    }
    process.env.SPOTIFY_CLIENT_ID = CLIENT_ID;
    process.env.SPOTIFY_CLIENT_SECRET = CLIENT_SECRET;

    return 1;
}

// Welcome page gives a few genres and moods to choose
// Chosen genre will recommend first few songs from Gemini
async function welcome(genre) {
  // Create a prompt
  const prompt = "For the following, do not number list them, just give the song names on each line. Generate 50 songs that were in the top 100 of the following genre: " + genre;

  // Send the prompt to the model
  const result = await model.generateContent(prompt);

  // Extract and log the output
  const response = await result.response;
  const text = response.text();
  console.log(text);
  return text;
}
// welcome("Rock n Roll", "Festive").catch(console.error);

// Function to get the access token (OAuth2 Client Credentials Flow)
async function getAccessToken() {
  const authOptions = {
    headers: {
      'Authorization': 'Basic ' + Buffer.from(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    data: 'grant_type=client_credentials',
    method: 'POST',
    url: 'https://accounts.spotify.com/api/token',
  };

  try {
    const response = await axios(authOptions);
    return response.data.access_token;
  } catch (error) {
    console.error('Error getting access token:', error.response.data);
    return 0;
  }
}

// Get Client Secret key for app use
async function getInput(prompt) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  
    return new Promise(resolve => {
      rl.question(prompt, answer => {
        rl.close();
        resolve(answer);
      });
    });
}

 
// Function to get the actual track information using the song ID
async function getArtist(songId, accessToken) {
  const trackUrl = 'https://api.spotify.com/v1/tracks/'+songId;

  try {
      const response = await axios.get(trackUrl, {
      headers: {
          'Authorization': `Bearer ${accessToken}`,
      },
      });

      const track = response.data;

      return track.album.images[0].url;
      // console.log('Track details:', track.name);
      // console.log('Artists:', track.artists.map(artist => artist.name).join(', '));
      // console.log('Album:', track.album.name);
      // console.log('Track URL:', track.external_urls.spotify);
      // return track;
  } catch (error) {
      console.error('Error getting track by ID:', error.response.data);
  }
}

// Funcion to get preview URLS for songs
async function getPreview(songName) {
  try {
    // Get preview URLs for a song (limit is optional, default is 5)
    const result = await spotifyPreviewFinder(songName, 1);
    
    let ret = {
      name: "",
      url: "",
      preview: "",
      img: "",

    };

    if (result.success) {
      result.results.forEach(song => {
        // console.log(`\nSong: ${song.name}`);
        ret.name = song.name;
        // console.log(`Spotify URL: ${song.spotifyUrl}`);
        ret.url = song.spotifyUrl;
        // console.log('Preview URLs:');
        ret.preview = song.previewUrls;
        // song.previewUrls.forEach(url => console.log(`- ${url}`));
      });
      // console.log(ret);
      return ret;
    } else {
      console.error('Error:', result.error);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Main execution
async function main() {
    // Gets Spotify credentials from user
    const credsValid = await getCreds();
    if (!credsValid) return console.log("Invalid Spotify credentials. Exiting.");

    // Gets access token for Spotify
    const accessToken = await getAccessToken();
    if (!accessToken) return;

    // Prompt user for genre and mood
    const genre = await getInput("Enter a music genre: ");
    const mood = await getInput("What's your mood right now?: ");

    // Get output from Gemini using user input for genre and mood
    const geminiOutput = await welcome(genre);
    const songTitles = geminiOutput.split('\n');

    const ret = [];
    // // For each song title in the list, gets the preview info from Spotify
    for (const title of songTitles) {
      if(!title) { break; }
      const song = await getPreview(title);
      const url = song.url.split("https://open.spotify.com/track/")

      const artname = await getArtist(url[1], accessToken);
      // console.log(artname);
      song.img = artname;
      ret.push(song);
    }
    // Stringify 
    const jsonString = JSON.stringify(ret);
    
    fs.writeFile('songs.json', jsonString, err => {
      if (err) {
        console.error(err);
      } else {
        console.log('File written successfully');
      }
    });

    return 1;
}

main();





/*
OLD STUFF BELOW

====================================================================================================================================



// Function to get the access token (OAuth2 Client Credentials Flow)



// Function to search for a song by title and get song ID
async function searchSong(songTitle, accessToken) {
    const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(songTitle)}&type=track&limit=1`;
  
    try {
      const response = await axios.get(searchUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
  
      const song = response.data.tracks.items[0]; // Get the first track result
      if (!song) {
        console.log('No song found for the title:', songTitle);
        return null;
      }
  
      console.log('Song found:', song.name);
      return song.id; // Return the song ID
    } catch (error) {
      console.error('Error searching for song:', error.response.data);
      return 0;
    }
}
  
// Function to get the actual track information using the song ID
async function getTrackById(songId, accessToken) {
    const trackUrl = `https://api.spotify.com/v1/tracks/${songId}`;

    try {
        const response = await axios.get(trackUrl, {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
        });

        const track = response.data;
        const previewUrl = track.preview_url;

        if (previewUrl) {
        console.log('Preview URL:', previewUrl);
        } else {
        console.log('No preview URL available for this track.');
        }

        console.log('Track details:', track.name);
        console.log('Artists:', track.artists.map(artist => artist.name).join(', '));
        console.log('Album:', track.album.name);
        console.log('Track URL:', track.external_urls.spotify);
        return track;
    } catch (error) {
        console.error('Error getting track by ID:', error.response.data);
    }
}
    */