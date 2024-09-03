const axios = require('axios');
const cheerio = require('cheerio');
const express = require('express');
const app = express();

const url = 'https://es.wikipedia.org/wiki/Categor%C3%ADa:M%C3%BAsicos_de_rap'
const urlbase = "https://es.wikipedia.org"
const links = []

const getInfo = (link, res) => {
    axios.get(urlbase + link).then((response)=> { // axios.get: para descargar el contenido de la página web que ponemos de parámetro
        if(response.status === 200) {
            const html = response.data // para almacenar el contenido HTML en una variable
            const $ = cheerio.load(html) // carga el html en cheerios para poder buscar elementos dentro de él
            const titulo = $("h1").text();
            // $('h1'): selecciona el elemento h1
            // .text(): extrae el contenido de texto
            
            
            //ahora usamos cheerios para recorrer las etiqueras img y p y recolectar enlaces de imágenes y texto de párrafos
            const imagenes = []
            $('img').each((i,ele) => {  // i de index, ele de element 
                const img = $(ele).attr("src")
                imagenes.push(img)
            })
            const parrafos = []
            $('p').each((i,ele) => {
                const p = $(ele).text()
                parrafos.push(p)
            })
            res.json({titulo, imagenes, parrafos}) 
            // así devuelve las respuestas en formato JSON, si las queremos en formato HTML usamos res.send y un template
        }
    });
}


app.get("/", (req,res) => {
    axios.get(url).then((response)=> {
        if(response.status === 200) {
            const html = response.data
            const $ = cheerio.load(html)
        
            $('#mw-pages a').each((i,ele) => {
                const link = $(ele).attr("href")
                links.push(link)
            });
            // $('#mw-pages a').each(... : Selecciona todos los enlaces 
            //dentro del elemento con ID mw-pages (que es donde Wikipedia lista los enlaces a las páginas de músicos) 
            // y agrega estos enlaces al array links.

            
            links.forEach(link => app.get(`${link}`, (req, res) => { // para cada enlace crea una nueva ruta en el servidor
                getInfo(link, res) // y en cada ruta se llama a la función que trae la info de la página de wikipedia
                
            }))
            res.send(`
                <h1>Enlaces</h1>
                <ul>
                    ${links.map(link => `<li><a href="http://localhost:3000${link}" target="_blank">${link}</a></li>`).join("")}
                </ul>
                `)
            
        }
    })
})



app.listen(3000, () => {
    console.log('express está escuchando en el puerto http://localhost:3000')
})