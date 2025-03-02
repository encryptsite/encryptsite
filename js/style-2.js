(function($){
	$.fn.animatedBackgroundStyle2 = function(options) {
		var opts = jQuery.extend({
			target: this,
			header_id: 'section',
			canvas_id: 'canvas',
			color: '#ffffff',
			scale: '0.1'
			
		}, options || {});
	
		var $selector	= $(this);
		var header_id	= this.header_id || opts.header_id;
		var canvas_id	= this.canvas_id || opts.canvas_id;
		var color		= this.color || opts.color;
		var scale		= this.scale || opts.scale;
		scale			= parseFloat(scale);
		var width, height, largeHeader, largeHeaderOffsetTop, canvas, ctx, circles, target, animateHeader = true;

		// Main
		initHeader(header_id, canvas_id, color, scale);
		addListeners();

		function initHeader(header_id, canvas_id, color, scale) {
			if(jQuery("#"+header_id).parents(".wsite-section-wrap").length){
				width	= jQuery("#"+header_id).parents(".wsite-section-wrap").width();
				height	= jQuery("#"+header_id).parents(".wsite-section-wrap").height();
			}else{
				width	= jQuery("body").width();
				height	= jQuery("body").height();
			}
			target = {x: width, y: height};

			largeHeader = document.getElementById(header_id);
			largeHeader.style.width = width+'px';
			largeHeader.style.height = height+'px';
			largeHeaderOffsetTop	= jQuery("#"+header_id).offset().top;

			canvas = document.getElementById(canvas_id);
			canvas.width = width;
			canvas.height = height;
			ctx = canvas.getContext('2d');

			// create particles
			circles = [];
			console.log(scale);
			for(var x = 0; x < width*0.5; x++) {
				var c = new Circle(scale);
				circles.push(c);
			}
			animate();
		}

		// Event handling
		function addListeners() {
			window.addEventListener('scroll', scrollCheck);
			window.addEventListener('resize', resize);
		}

		function scrollCheck() {
			if(document.body.scrollTop > (largeHeaderOffsetTop+height)) animateHeader = false;
			else animateHeader = true;
		}

		function resize() {
			if(jQuery("#"+header_id).parents(".wsite-section-wrap").length){
				width	= jQuery("#"+header_id).parents(".wsite-section-wrap").width();
				height	= jQuery("#"+header_id).parents(".wsite-section-wrap").height();
			}else{
				width	= jQuery("body").width();
				height	= jQuery("body").height();
			}
			largeHeader.style.width = width+'px';
			largeHeader.style.height = height+'px';
			canvas.width = width;
			canvas.height = height;
		}

		function animate() {
			if(animateHeader) {
				ctx.clearRect(0,0,width,height);
				for(var i in circles) {
					circles[i].draw();
				}
			}
			requestAnimationFrame(animate);
		}

		// Canvas manipulation
		function Circle(scale) {
			var _this	= this;
			var _scale	= scale;

			// constructor
			(function() {
				_this.pos = {};
				init(_scale);
				//console.log(_this);
			})();

			function init(_scale) {
				_this.pos.x = Math.random()*width;
				_this.pos.y = height+Math.random()*100;
				_this.alpha = 0.1+Math.random()*0.3;
				_this.scale = _scale+Math.random()*0.3;
				console.log(_scale);
				_this.velocity = Math.random();
			}

			this.draw = function() {
				if(_this.alpha <= 0) {
					init();
				}
				_this.pos.y -= _this.velocity;
				_this.alpha -= 0.0005;
				var rgb	= hexToRgb(color);
				if(rgb!=null){
					var r	= rgb.r;
					var g	= rgb.g;
					var b	= rgb.b;
					ctx.beginPath();
					ctx.arc(_this.pos.x, _this.pos.y, _this.scale*10, 0, 2 * Math.PI, false);
					ctx.fillStyle = 'rgba('+r+','+g+','+b+','+ _this.alpha+')';
					ctx.fill();
				}
			};
		}
		function hexToRgb(hex) {
			var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
			return result ? {
				r: parseInt(result[1], 16),
				g: parseInt(result[2], 16),
				b: parseInt(result[3], 16)
			} : null;
		}
		
		return resize();
	}
})(jQuery);