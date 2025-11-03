import {Canvas,entity} from '/glitchengine/glitch_engine.mjs'

/*	HEIGHT and WIDTH reflect the resolution divided by 4. Division by 4 allows the page run smoothly on larger devices
	Another solution could have been to define breakpoints, could be cleaner on really large displays.

	Could change HEIGHT and WIDTH to vars, and downsize the grid if performance isn't good. Until a grid resolution is fluid enough. Definitely an improvement for lower end processors, with huge resolution.

	Defines the size of the grid the cells are on
*/
const HEIGHT = Math.ceil(screen.height /4);
const WIDTH = Math.ceil(screen.width /4);

/*
	Definition of a cell
	Must be provided with the canvas it is dependent of
*/

class life extends entity{

	//The state of the cell
    alive = false;

    constructor(bck_canvas) {
        super(bck_canvas);
    }


	/*	Runs on each tick
		Calculates the number of alive neighbors,
		Changes states based on number of alive neighbors then changes
		the displayed colors

		Must be supplied a single dimension array of entities.
		and it's own index in it.
	*/
    update(entity_list,index){
		//	number of live neighbors
    	let nb_alive = 0;

		/*	Picks out neighbors in the entity_list
			The index (-/+ WIDTH) -/+ 1 method allows for fast lookup of neighbors with no need to handle edge case
			undefined neighbors are not alive

		*/

       	let neighbors = [
            entity_list[index-WIDTH-1],
            entity_list[index-WIDTH],
            entity_list[index-WIDTH+1],
            entity_list[index-1],
            entity_list[index+1],
            entity_list[index+WIDTH-1],
            entity_list[index+WIDTH],
            entity_list[index+WIDTH+1]
        ]

		//Increment nb_alive if a neighbor exists and is alive.

        neighbors.forEach(element =>{
            if(element && element.alive){
                nb_alive ++;
            }
        })
        
		/* Core game of life rule https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life*/

        if(nb_alive == 3){
            this.alive = true;
        }else if(nb_alive == 2 ){

        }else{
            this.alive = false;
        }
        

		//Defines how the engine should display the cell based on alive state.

        if(this.alive){
            this.r = 0;
            this.g = 0;
            this.b = 0;
        }else{
            this.r = 250;
            this.g = 250;
            this.b = 250;
        }
    }
}


/*
	I use a double canvas architecture
	A back canvas creates the screen as an array of RGBA values
	This exists only in memory and is not displayed.

	It is then passed to a front canvas which is displayed.
*/

//The back canvas. Expects 3 arguments, is_back_canvas, height, and width

let bck_canvas = new Canvas(true,HEIGHT,WIDTH);


/*	The "front" canvas
	Actually displays the screen given to it by the back canvas.
	
*/
let c = new Canvas(false,HEIGHT,WIDTH);


// Engine relative to the game of life. Handles Game loop

class Engine{

	//Contains the cells
    entity_list = [];


	//	Is ran every tick
    game_loop(){

		/*	Counts the time taken to calculate and render frame*/
        const now = performance.now();
        const frameDuration = now - this.lastFrameTime;
        this.lastFrameTime = now;

		/*	Contains a map of the previous grid state
			We only need the alive state of each cell
		*/
        let old_entity_list = this.entity_list.map(cell => ({alive:cell.alive}));


        this.entity_list.forEach((element,index)=>{
			//	Updates the cell internal state
            element.update(old_entity_list,index);
			//	Updates the cell render
            element.build();
        })
		//Calls the render method of the back canvas and supplies it the "front canvas"
        bck_canvas.render(c.context);

		//Console log of the time needed to make and display the frame.
        //console.log("Frame duration:", frameDuration.toFixed(2), "ms");
		console.log(this.entity_list.length);

		//Calls back itself once the frame is drawn
        requestAnimationFrame(()=> this.game_loop())
    }
}

//Creates the engine/game loop
let engine = new Engine();


/*	Declaration and immediate execution
	is ran once on startup, 
	defines the background color.
	and populates entity_list with cells.

*/

(()=>{

	c.setBackground("250,250,250");

    for(let y=0; y<HEIGHT; y++){
        for(let x=0; x<WIDTH; x++){

            let cell = new life(bck_canvas);

            cell.mode = "pixel";
            cell.posx = x;
            cell.posy = y;

            const random = Math.random();
			const threshold = 0.9;

			/*
				Defines if generated cells are alive at startup
				Uses Math.random function which return a float between 0 and 1;
				Is then evaluated against threshold, if it is more than threshold the cell is alive

				threshold closer to 0 results in only living cells initialy.
				threshold closer to 1 results in only dead cells initialy.
			*/

            cell.alive = random  > threshold;
			
            engine.entity_list.push(cell)
        }
    }


	//Updates the cells and prep them for the first render

    engine.entity_list.forEach((element,index)=>{
        element.update(engine.entity_list,index)
        element.build();
    })
})()

engine.game_loop();


/*		Possible optimizations

	The rendering is fairly optimised,
	however it is made by the cpu therefore frame rates can easily crumble on lower end cpu with big screens
	Note that this is simply due to the fact that cpu's are simply unfit for the task of rendering,
	but some can power through anyway.

	There are multiple optimizations possible though.

	I could fine tune the algorithm that calls for cell's updates.
	Right now, it simply updates every cells. I could instead search only living cells. and only update neighboring cells.
	This alone ensures that only cells that could change states if updated will be updated. Could easily multiply framerate by 1.5
	Of course I would have to make sure that cells are updated only once.

	Right now everything is calculated only by a single thread, that's easy to make, easy to maintain, but highly ineficient.
	Basically the cpu may have multiple hearts and threads and because of this single thread architecture I use,
	So most cores of the cpu sit unused. I could divide the grid in sectors and task web workers with updating cells in those sectors.
	Cool but probably not worth the trouble on this project.
	The game of life is made up of simple rules. So the logical part is still fast even if made poorly.
	I don't expect a lot of framerate gain by using this method, 4ms per frame give or take.

	The most i could gain would be by using web-gl. Because web-gl is rendered by the GPU. It is suited for the task.
	But Web-gl is used far differently than a canvas managed by cpu. So the task is fairly big.
	But this is the most significant optimisation.

*/
