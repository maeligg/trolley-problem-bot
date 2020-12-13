require('dotenv').config();
const fs = require('fs'),
    Jimp = require('jimp'),
    Twit = require('twit'),
    config = {
        twitter: {
            consumer_key: process.env.CONSUMER_KEY,
            consumer_secret: process.env.CONSUMER_SECRET,
            access_token: process.env.ACCESS_TOKEN,
            access_token_secret: process.env.ACCESS_TOKEN_SECRET
        }
    },
    T = new Twit(config.twitter);

const tweet = () => {
    fs.readdir('./img', async (err, files) => {
        const randomImageName1 = files.splice(Math.floor(Math.random() * files.length), 1)[0];
        const randomImageName2 = files.splice(Math.floor(Math.random() * files.length), 1)[0];
        const randomImage1 = await Jimp.read(`./img/${randomImageName1}`);
        const randomImage2 = await Jimp.read(`./img/${randomImageName2}`);
        const randomImageString1 = randomImageName1.replace(/(\.jpg|\.jpeg|\.png)/i, '').replace(/_/g, ' ');
        const randomImageString2 = randomImageName2.replace(/(\.jpg|\.jpeg|\.png)/i, '').replace(/_/g, ' ');

        Jimp.read('./template.png')
            .then(image => {
                image
                .composite(randomImage1, 640, 280)
                .composite(randomImage2, 640, 40)
                // Uncomment this line if you'd like to generate a local copy of the image without calling the Twitter API
                // .write('./out.png');
                .getBase64(Jimp.MIME_JPEG, (err, src) => {
                    if (err) {
                        console.log('ERROR:\n', err);
                    }
                    T.post('media/upload', { media_data: src.split('base64,').pop() }, function(err, data) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log('tweeting the image...');
                            
                            T.post(
                                'statuses/update',
                                {
                                    status: `What do you do ?\nLike to do nothing and let ${randomImageString1} die.\nRetweet to pull the lever and kill ${randomImageString2}.`,
                                    media_ids: new Array(data.media_id_string)
                                },
                                function(err) {
                                    if (err) {
                                        console.log('ERROR:\n', err);
                                    }
                                }
                            );
                        }
                    });
                });
            });
    });
}

tweet();

