# podslim
iTunes Podcasts simple API made with Node.js

##About
This project is a simple parser of iTunes pages, made with Node.js, to list and search for podcasts. All data are returned in JSON format.

You can access an online version of this API [here](http://podslim.herokuapp.com/) and download an Android App that uses this API [here](https://play.google.com/store/apps/details?id=com.afilhodaniel.podslim).

##Endpoints

**GET /api/search/:query**

Return a list of podcasts that your names matches with **:query** parameter.

**GET /api/highlights/:country/:limit**

Return a limited list of highlighted podcasts second the iTunes algorithm by country.

You should specify a **:country** (br, pt, us..) and a **:limit**.

**GET /api/podcast/:country/:id**

Return the informations about the podcast that matches with **:id** parameter.

The **:country** parameter specifies the language that the informations are returned.

**GET /api/podcast_feed/:id**

Return the list of episodes of podcast that matches with **:id** parameter.

## Contributions

If your are interested to contribute with this project anyway. Please, do this. Thank's!
