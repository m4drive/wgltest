class WGL{
	constructor(){
		
	}
}
WGL.Instance = class Instance{
	constructor(containerElement){
		//init
		this.gl=this.initWebGL(containerElement);
		this.objects=[];
		this.pMatrix=mat4.create();
		this.cameraSettings={
			fieldOfViewAngle:45,
			minDistance:0.1,
			maxDistance:100.0
		};
		this.lightningSettings={
			enabled:true,
			directional:{
				color:[0.8,0.8,0.8],
				direction:[-1,-1,-1]
			},
			ambient:{
				color:[0.8,0.8,0.8]
			}
		}
	}
	initWebGL(canvas) {
		var names = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
		var gl = null;
		for (var ii = 0; ii < names.length; ++ii) {
			try {
				gl = canvas.getContext(names[ii]);
			} catch(e) {}
			if (gl) {
				break;
			}
		}
		gl.viewportWidth = canvas.width;
		gl.viewportHeight = canvas.height;
		
		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.enable(gl.DEPTH_TEST);
		
		return gl;
	}
	prepare()
	{
		//camera settings
		mat4.perspective(this.cameraSettings.fieldOfViewAngle, this.gl.viewportWidth / this.gl.viewportHeight, this.cameraSettings.minDistance ,this.cameraSettings.maxDistance, this.pMatrix);
		//transfer camera, lightning and gl to objects
		this.objects.forEach((x)=>{
			x.setGL(this.gl);
			x.setCamera(this.pMatrix);
			x.setLightning(this.lightningSettings);
			x.prepare(this.gl);
		});
	}
	drawScene()
	{
		
		this.gl.viewport(0, 0, this.gl.viewportWidth, this.gl.viewportHeight);
		this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
		
		
		this.objects.forEach((x)=>{
			x.draw();
		});
	}
}
WGL.Lib=class Lib{
	
}

