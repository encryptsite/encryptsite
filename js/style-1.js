(function($){
	$.fn.animatedBackgroundStyle1 = function(options) {
		var opts = jQuery.extend({
			target: this,
			header_id: 'section',
			canvas_id: 'canvas',
			color: '#ffffff'
			
		}, options || {});
	
		var $selector	= $(this);
		var header_id	= this.header_id || opts.header_id;
		var canvas_id	= this.canvas_id || opts.canvas_id;
		var color		= this.color || opts.color;
		var width, height, largeHeader, largeHeaderOffsetTop, largeHeaderOffsetLeft, canvas, ctx, points, target, animateHeader = true;
		
		initHeader(header_id, canvas_id, color);
		initAnimation();
		addListeners();

		function initHeader(header_id, canvas_id, color) {
			if(jQuery("#"+header_id).parents(".wsite-section-wrap").length){
				width	= jQuery("#"+header_id).parents(".wsite-section-wrap").width();
				height	= jQuery("#"+header_id).parents(".wsite-section-wrap").height();
			}else{
				width	= jQuery("body").width();
				height	= jQuery("body").height();
			}
			target = {x: width/2, y: height/2};

			largeHeader = document.getElementById(header_id);
			largeHeader.style.width = width+'px';
			largeHeader.style.height = height+'px';
			largeHeaderOffsetTop	= jQuery("#"+header_id).offset().top;
			largeHeaderOffsetLeft	= jQuery("#"+header_id).offset().left;
			//console.log(largeHeaderOffsetTop);

			canvas = document.getElementById(canvas_id);
			canvas.width = width;
			canvas.height = height;
			ctx = canvas.getContext('2d');

			// create points
			points = [];
			for(var x = 0; x < width; x = x + width/20) {
				for(var y = 0; y < height; y = y + height/20) {
					var px = x + Math.random()*width/20;
					var py = y + Math.random()*height/20;
					var p = {x: px, originX: px, y: py, originY: py };
					points.push(p);
				}
			}

			// for each point find the 5 closest points
			for(var i = 0; i < points.length; i++) {
				var closest = [];
				var p1 = points[i];
				for(var j = 0; j < points.length; j++) {
					var p2 = points[j]
					if(!(p1 == p2)) {
						var placed = false;
						for(var k = 0; k < 5; k++) {
							if(!placed) {
								if(closest[k] == undefined) {
									closest[k] = p2;
									placed = true;
								}
							}
						}

						for(var k = 0; k < 5; k++) {
							if(!placed) {
								if(getDistance(p1, p2) < getDistance(p1, closest[k])) {
									closest[k] = p2;
									placed = true;
								}
							}
						}
					}
				}
				p1.closest = closest;
			}

			// assign a circle to each point
			for(var i in points) {
				var c = new Circle(points[i], 2+Math.random()*2, color);
				points[i].circle = c;
			}
		}

		// Event handling
		function addListeners() {
			if(!('ontouchstart' in window)) {
				window.addEventListener('mousemove', mouseMove);
			}
			window.addEventListener('scroll', scrollCheck);
			window.addEventListener('resize', resize);
		}

		function mouseMove(e) {
			var posx = posy = 0;
			if (e.pageX || e.pageY) {
				posx = e.pageX - largeHeaderOffsetLeft;
				posy = e.pageY - largeHeaderOffsetTop;
				//console.log("page");
			}
			else if (e.clientX || e.clientY)    {
				posx = e.clientX + document.documentElement.scrollLeft - largeHeaderOffsetLeft;
				posy = e.clientY + document.documentElement.scrollTop - largeHeaderOffsetTop;
				//console.log("client");
			}
			target.x = posx;
			target.y = posy;
			//console.log(target.x+'/'+target.y);
		}

		function scrollCheck() {
			if(document.body.scrollTop > (largeHeaderOffsetTop+height)) animateHeader = false;
			else animateHeader = true;
			//console.log(animateHeader);
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

		// animation
		function initAnimation() {
			animate();
			for(var i in points) {
				shiftPoint(points[i]);
			}
		}

		function animate() {
			if(animateHeader) {
				ctx.clearRect(0,0,width,height);
				for(var i in points) {
					// detect points in range
					if(Math.abs(getDistance(target, points[i])) < 4000) {
						points[i].active = 0.3;
						points[i].circle.active = 0.6;
					} else if(Math.abs(getDistance(target, points[i])) < 20000) {
						points[i].active = 0.1;
						points[i].circle.active = 0.3;
					} else if(Math.abs(getDistance(target, points[i])) < 40000) {
						points[i].active = 0.02;
						points[i].circle.active = 0.1;
					} else {
						points[i].active = 0;
						points[i].circle.active = 0;
					}
					//console.log(Math.abs(getDistance(target, points[i])));
					drawLines(points[i]);
					points[i].circle.draw();
				}
			}
			requestAnimationFrame(animate);
		}

		function shiftPoint(p) {
			TweenLite.to(p, 1+1*Math.random(), {x:p.originX-50+Math.random()*100,
				y: p.originY-50+Math.random()*100, ease:Circ.easeInOut,
				onComplete: function() {
					shiftPoint(p);
				}});
		}

		// Canvas manipulation
		function drawLines(p) {
			if(!p.active) return;
			var rgb	= hexToRgb(color);
			if(rgb!=null){
				var r	= rgb.r;
				var g	= rgb.g;
				var b	= rgb.b;
				for(var i in p.closest) {
					ctx.beginPath();
					ctx.moveTo(p.x, p.y);
					ctx.lineTo(p.closest[i].x, p.closest[i].y);
					ctx.strokeStyle = 'rgba('+r+','+g+','+b+','+ p.active+')';
					ctx.stroke();
				}
			}
		}

		function Circle(pos,rad,color) {
			var _this = this;

			// constructor
			(function() {
				_this.pos = pos || null;
				_this.radius = rad || null;
				_this.color = color || null;
			})();
			var rgb	= hexToRgb(_this.color);
			if(rgb!=null){
				var r	= rgb.r;
				var g	= rgb.g;
				var b	= rgb.b;
				this.draw = function() {
					if(!_this.active) return;
					ctx.beginPath();
					ctx.arc(_this.pos.x, _this.pos.y, _this.radius, 0, 2 * Math.PI, false);
					ctx.fillStyle = 'rgba('+r+','+g+','+b+','+ _this.active+')';
					ctx.fill();
				};
			}
		}

		// Util
		function getDistance(p1, p2) {
			return Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2);
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