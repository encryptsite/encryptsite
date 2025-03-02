(function($){
	$.fn.animatedBackgroundStyle3 = function(Options) {
		
		var Anim = { //animation settings
			'duration': 3000,
			'interval' : 10,
			'stepUnit' : 1.0,
			'currUnit' : 0.0,
			'startColor1': '#029ccc',
			'startColor2': '#9ed300',
			'endColor1': '#f70073',
			'endColor2': '#27c4f4',
			'direction' : 'topbottom'
		}

		Anim = $.extend(true, Anim, Options);

		var startColor1	= Anim.startColor1;
		var startColor2	= Anim.startColor2;
		var endColor1	= Anim.endColor1;
		var endColor2	= Anim.endColor2;
		var stopAColor	= [];
		var stopBColor	= [];
		stopAColor[0]	= hexToRgb(Anim.startColor1);
		stopAColor[1]	= hexToRgb(Anim.endColor1);
		stopBColor[0]	= hexToRgb(Anim.startColor2);
		stopBColor[1]	= hexToRgb(Anim.endColor2);
		Anim			= {
			'duration': Anim.duration,
			'interval' : 10,
			'stepUnit' : 1.0,
			'currUnit' : 0.0,
			'stopAColor': stopAColor,
			'stopBColor': stopBColor,
			'direction' : Anim.direction,
		}
		window.requestAnimFrame = (function(){
			
		  return  window.requestAnimationFrame       ||
				  window.webkitRequestAnimationFrame ||
				  window.mozRequestAnimationFrame    ||
				  function( callback ){
					window.setTimeout(callback, 1000 / 60);
				  };
		})();

		//interpolation
		function lerp(a, b, u) {
			return (1 - u) * a + u * b;
		}

		function Gradient(context, width, height){
			this.ctx = context;
			this.width = width;
			this.height = height;
			this.colorStops = [];
			this.currentStop = 0;
		}

		Gradient.prototype.addStop = function(pos, colors){
			var stop = {'pos': pos, 'colors':colors, 'currColor': null}
			this.colorStops.push(stop)
		}

		Gradient.prototype.updateStops = function(){ //interpolate colors of stops
			var steps = Anim.duration / Anim.interval,
					step_u = Anim.stepUnit/steps
					stopsLength = this.colorStops[0].colors.length - 1;

			for(var i = 0; i < this.colorStops.length; i++){ //cycle through all stops in gradient
				var stop = this.colorStops[i],
						startColor = stop.colors[this.currentStop],//get stop 1 color
						endColor, r, g, b;

						if(this.currentStop < stopsLength){ //get stop 2 color, go to first if at last stop
							endColor = stop.colors[this.currentStop + 1];
						} else {
							endColor = stop.colors[0];
						}
				
				//interpolate both stop 1&2 colors to get new color based on animaiton unit
				r = Math.floor(lerp(startColor.r, endColor.r, Anim.currUnit));
				g = Math.floor(lerp(startColor.g, endColor.g, Anim.currUnit));
				b = Math.floor(lerp(startColor.b, endColor.b, Anim.currUnit));

				stop.currColor = 'rgb('+r+','+g+','+b+')';
			}

			// update current stop and animation units if interpolaiton is complete
			if (Anim.currUnit >= 1.0){
				Anim.currUnit = 0;
				if(this.currentStop < stopsLength){
					this.currentStop++;
				} else {
					this.currentStop = 0;
				}
			}

			Anim.currUnit += step_u; //increment animation unit
		}

		Gradient.prototype.draw = function(){
			var gradient = ctx.createLinearGradient(0,0,0,this.height);
				
			if (Anim.direction == "topbottom") {
				gradient = ctx.createLinearGradient(0,0,0,this.height);
			}
			
			if (Anim.direction == "leftright") {
				gradient = ctx.createLinearGradient(0,0,this.width,0);
			}
			
			if (Anim.direction == "topleftrightbottom") {
				gradient = ctx.createLinearGradient(0,0,this.width,this.width);
			}
			
			if (Anim.direction == "toprightleftbottom") {
				gradient = ctx.createLinearGradient(this.width,0,0,this.width);
			}
			
			for(var i = 0; i < this.colorStops.length; i++){
				var stop = this.colorStops[i],
						pos = stop.pos,
					color = stop.currColor;

				gradient.addColorStop(pos,color);
			}

			this.ctx.clearRect(0,0,this.width,this.height);
			this.ctx.fillStyle = gradient;
			this.ctx.fillRect(0,0,this.width,this.height);
		}

		var $width, $height, gradient,
			canvasElement = this;
			canvas = $(this)[0],
			ctx = canvas.getContext("2d"),
			stopAColor = Anim.stopAColor,
			stopBColor = Anim.stopBColor;

		var updateUI = function(){
				$width	= $(canvasElement).parents(".wsite-section-wrap").width();
				$height	= $(canvasElement).parents(".wsite-section-wrap").height();

				canvas.width = $width;
				canvas.height = $height;

				gradient = new Gradient(ctx, canvas.width, canvas.height);
				gradient.addStop(0, stopAColor);
				gradient.addStop(1, stopBColor);
		}


		updateUI();

		$(window).resize(function(){
			updateUI();
		});

		(function animloop(){
			requestAnimFrame(animloop);
			gradient.updateStops();
			gradient.draw();
		})();

		function hexToRgb(hex) {
			var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
			return result ? {
				r: parseInt(result[1], 16),
				g: parseInt(result[2], 16),
				b: parseInt(result[3], 16)
			} : null;
		}
	}
})(jQuery);