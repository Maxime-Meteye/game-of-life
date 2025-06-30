export class Canvas{

    used_canvas;
    context;
    height;
    width;
    image;
    data;
    displayed_array = [];
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
        if (!hidden) {
            this.used_canvas.setAttribute("width", this.width);
            this.used_canvas.setAttribute("height", this.height);
        }
    }

    setBackground(color){
        this.context.fillStyle = `rgb(${color})`;
        this.context.fillRect(0, 0, this.used_canvas.width, this.used_canvas.height);
        this.context.fillStyle = `rgb(0,500,500)`;
        this.context.fillRect((this.used_canvas.width/2), 0, 1,this.used_canvas.height);
        this.context.fillRect(0, (this.used_canvas.height/2), this.used_canvas.width,1);
    }

    buildCircle(x,y,radius,color){
        this.context.strokeStyle = `rgb(${color})`;
        this.context.fillStyle = `rgb(${color})`;
        this.context.beginPath();
        this.context.arc(x,y,radius,0,2*Math.PI);
        this.context.fill();
        this.context.stroke();
    }
    buildPixel(pixel_data){
        const i = (pixel_data.posy * this.width + pixel_data.posx) * 4;
        this.data[i] = pixel_data.r;
        this.data[i+1] = pixel_data.g;
        this.data[i+2] = pixel_data.b;
        this.data[i+3] = pixel_data.a;
        //console.log("updated data",this.data[i],this.data[i+1],this.data[i+2],this.data[i+3])
    }

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


    render(dest_canvas){
        //this.context.putImageData(this.image,0,0)
        
        createImageBitmap(this.image).then(bitmap => {
            this.context.drawImage(bitmap, 0, 0);
        });
        dest_canvas.drawImage(this.used_canvas,0,0); //TODO Gérer le render pour afficher les particules et les cercles
        
    }
}

export class entity{
    posx;
    posy;
    vx = 0;
    vy = 0;
    height = 1;
    width = 1;
    mode = "pixel";
    r = 0;
    g = 0;
    b = 0;
    a = 250;
    used_canvas;
    constructor(back_canvas){
        this.used_canvas = back_canvas;
    }

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