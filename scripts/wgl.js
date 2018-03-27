class WGL{
	constructor(){
		
	}
}
WGL.Camera = class Camera{
	constructor(){
		this.settings={
			fieldOfViewAngle:45,
			minDistance:0.1,
			maxDistance:20.0,
		}
		this.pMatrix=mat4.create();
		this.vMatrix=mat4.create();
		this.vpMatrix=mat4.create();
		this.position=[0,0,0];
		this.rotation=[0,0,0];
	}
	degToRad(degrees) {
        return degrees * Math.PI / 180;
    }
	setDimesions(canvasWidth,canvasHeight)
	{
		mat4.perspective(this.pMatrix, this.settings.fieldOfViewAngle, canvasWidth / canvasHeight, this.settings.minDistance ,this.settings.maxDistance);
		this.calculateVPMatrix();
	}
	calculateVPMatrix()
	{
		var cameraMatrix=mat4.create();
		//position
		mat4.translate(cameraMatrix, cameraMatrix, this.position);
		//rotation
		var newRotationMatrix = mat4.create();
		mat4.identity(newRotationMatrix);
		mat4.rotate(newRotationMatrix, newRotationMatrix, this.degToRad(this.rotation[0]), [1, 0, 0]);
		mat4.rotate(newRotationMatrix, newRotationMatrix, this.degToRad(this.rotation[1]), [0, 1, 0]);
		mat4.rotate(newRotationMatrix, newRotationMatrix, this.degToRad(this.rotation[2]), [0, 0, 1]);
		mat4.multiply(this.vMatrix, cameraMatrix, newRotationMatrix);
		mat4.multiply(this.vpMatrix,this.pMatrix, this.vMatrix);
	}
	update(objects){
		this.calculateVPMatrix();
		objects.forEach(function(item){
			item.setCamera(this.vpMatrix);
		}.bind(this));
	}
}
WGL.Instance = class Instance{
	constructor(containerElement){
		//init
		this.gl=this.initWebGL(containerElement);
		this.objects=[];

		this.camera=new WGL.Camera();

		this.lightningSettings={
			enabled:true,
			directional:{
				color:[0.2,0.2,0.2],
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
		//gl.viewportWidth = canvas.width;
		//gl.viewportHeight = canvas.height;
		
		gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.enable(gl.DEPTH_TEST);
		
		return gl;
	}
	prepare()
	{
		//camera settings
		//mat4.perspective(this.pMatrix, this.cameraSettings.fieldOfViewAngle, this.gl.viewportWidth / this.gl.viewportHeight, this.cameraSettings.minDistance ,this.cameraSettings.maxDistance);
		//mat4.perspective(this.pMatrix, this.cameraSettings.fieldOfViewAngle, this.gl.canvas.clientWidth / this.gl.canvas.clientHeight, this.cameraSettings.minDistance ,this.cameraSettings.maxDistance);
		this.camera.setDimesions(this.gl.canvas.clientWidth, this.gl.canvas.clientHeight);

		//transfer camera, lightning and gl to objects
		this.objects.forEach((x)=>{
			x.setGL(this.gl);
			x.setCamera(this.camera.vpMatrix);
			x.setLightning(this.lightningSettings);
			x.prepare(this.gl);
		});
	}
	drawScene()
	{
		
		//this.gl.viewport(0, 0, this.gl.viewportWidth, this.gl.viewportHeight);
		this.gl.viewport(0, 0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
		
		
		this.objects.forEach((x)=>{
			x.draw();
		});
	}
}
WGL.Lib=class Lib{
	
}

