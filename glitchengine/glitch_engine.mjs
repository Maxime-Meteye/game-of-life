
/*
Copyright © <copyright holders>
Permission is hereby granted, free of charge, to any person obtaining a copy of this software
and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

The Software is provided “as is”, without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose and noninfringement. In no event shall the authors or copyright holders be liable for any claim, damages or other liability, whether in an action of contract, tort or otherwise, arising from, out of or in connection with the software or the use or other dealings in the Software. »

*/



/*
	Glitch engine is the rendering engine i made for the game.
	It needs to be initialized as two different instances, one for the back canvas, and one for the front canvas.

	There is some code useless for the game of life here as it was made with the intent to be used in other projects.

 */
export class Canvas{

	//The canvas used to render or calculate frame
    used_canvas;

	// The canva's drawing context
    context;

	// Canva's size
    height;
    width;

	//Generates an RGBA array  of the frame
    image;

	/*	The RGBA array of the frame strucutred like so 
		[pix1_R,pix1_G,pix1_B,pix1_A,pix2_R,pix2_G,pix2_B,pix2_A, ...]
	*/
    data;

    displayed_array = [];

	// hidden determines if the canvas is a back or front canvas, HEIGHT and WIDTH the resolution
    constructor(hidden = false,HEIGHT,WIDTH) {
        if (hidden) {
            this.used_canvas = document.createElement("canvas");
            this.height = HEIGHT;
            this.width = WIDTH;
        } else {
            this.used_canvas = document.querySelector("#game_canvas");
            this.width = WIDTH;
            this.height = HEIGHT;
        }

        this.used_canvas.width = this.width;
        this.used_canvas.height = this.height;

        this.context = this.used_canvas.getContext("2d");
        this.image = this.context.createImageData(this.width, this.height);
        this.data = this.image.data;

		//changes the displayed resolution of the canvas.
        if (!hidden) {
            this.used_canvas.setAttribute("width", this.width);
            this.used_canvas.setAttribute("height", this.height);
        }
    }

	//Draws the background
    setBackground(color){
        this.context.fillStyle = `rgb(${color})`;
        this.context.fillRect(0, 0, this.used_canvas.width, this.used_canvas.height);
        this.context.fillStyle = `rgb(0,500,500)`;
        this.context.fillRect((this.used_canvas.width/2), 0, 1,this.used_canvas.height);
        this.context.fillRect(0, (this.used_canvas.height/2), this.used_canvas.width,1);
    }

	//Draws a circle
    buildCircle(x,y,radius,color){
        this.context.strokeStyle = `rgb(${color})`;
        this.context.fillStyle = `rgb(${color})`;
        this.context.beginPath();
        this.context.arc(x,y,radius,0,2*Math.PI);
        this.context.fill();
        this.context.stroke();
    }
	//Draws a pixel, expects an object with posy, posx, r,g,b,a values
    buildPixel(pixel_data){
		/*	determines the index where the pixel would be located in this.data based on resolution
			and pixel position
		*/
        const i = (pixel_data.posy * this.width + pixel_data.posx) * 4;
        this.data[i] = pixel_data.r;
        this.data[i+1] = pixel_data.g;
        this.data[i+2] = pixel_data.b;
        this.data[i+3] = pixel_data.a;
        //console.log("updated data",this.data[i],this.data[i+1],this.data[i+2],this.data[i+3])
    }

	/*
    draw(display_to){
        this.displayed_array.forEach(element => {
            //this.context.beginPath();
            if(element.mode == "pixel"){
                this.context.fillStyle = `rgb(${element.color})`;
                this.context.fillRect(element.posx-(element.width/2),element.posy-(element.height/2),element.width,element.height);
            }else if(element.mode == "rect"){
                this.context.fillStyle = `rgb(${element.color})`;
                this.context.fillRect(element.posx-(element.width/2),element.posy-(element.height/2),element.width,element.height);
            }
        });
    }
	*/


	/*
		Renders the frame on the the supplied canvas, really should only be called on the back canvas,
	*/
    render(dest_canvas){
        //this.context.putImageData(this.image,0,0)
        
		//creates a bitmap out of this.image then draws it on this canvas.
        createImageBitmap(this.image).then(bitmap => {
            this.context.drawImage(bitmap, 0, 0);
        });

		//draws the image made on the front canvas.
        dest_canvas.drawImage(this.used_canvas,0,0);
        
    }
}


//Defines every entity managed by the engine
export class entity{
    posx;
    posy;

	//describes how the entity should be rendered
	//here it is a pixel
    mode = "pixel";

	//pixel color definition
    r = 0;
    g = 0;
    b = 0;
    a = 250;

	//the canvas the pixel belongs to
    used_canvas;

    constructor(back_canvas){
        this.used_canvas = back_canvas;
    }

	//Tells glitch engine to draw the entity with relevant properties for it's display mode
    build(){
        if(this.mode == "pixel"){
            this.used_canvas.buildPixel({
                posy: this.posy,
                posx: this.posx,
                width: this.width,
                r: this.r,
                g: this.g,
                b: this.b,
                a: this.a
            });
        }
    }
}