WGL.Raycast=class Raycast{
	constructor(WGLInstance){
		this.WGLInstance=WGLInstance;
	}
	RaycastFromMouse(outHit,mouseEvent,maxDistance,layerMask)
	{
		var x=mouseEvent.clientX-this.WGLInstance.gl.canvas.offsetLeft;
		var y=mouseEvent.clientY-this.WGLInstance.gl.canvas.offsetTop;
		
		var mm = mat4.create();
		mat4.identity(mm);
		var pm=this.WGLInstance.pMatrix;
		var viewport=[0,0,this.WGLInstance.gl.canvas.width,this.WGLInstance.gl.canvas.height];
		var m = mat4.clone(mm);
		
		mat4.invert(m, m);
        mat4.multiply(m, pm, m);
        mat4.invert(m, m);
		
		var inf = [];
		var z=1;
		if (maxDistance<this.WGLInstance.cameraSettings.maxDistance)
		{
			z=maxDistance/this.WGLInstance.cameraSettings.maxDistance;
		}
		
		inf[0]=(x-viewport[0])/viewport[2]*2.0-1.0;
        inf[1]=(viewport[3]-y)/viewport[3]*2.0-1.0;
        inf[2]=2.0*z-1.0;
        inf[3]=1.0;
		
		var out={};
		vec4.transformMat4(out,inf,m);
        if(out[3]==0.0)
           return null;
    
        out[3]=1.0/out[3];
        console.log([out[0]*out[3], out[1]*out[3], out[2]*out[3]]);
		//TODO: update after adding camera transform;
		var origin=[0,0,0];
		var direction=vec3.clone(out);
		console.log("ray mouse place-> ",x,y);
		
		return this.Raycast(outHit,origin,direction,maxDistance);
	}
	Raycast(hitObject,origin, direction, maxDistance, layerMask)
	{
		//TODO:implement layerMask
		var result=false;
		var triangle;
		var out=vec4.create();
		var intersection={};
		var objectIndex=-1;
		var triangleCount=0;
		this.WGLInstance.objects.forEach((obj,index)=>{
			triangleCount=obj.indexData.length/3;
			for (var i=0;i<triangleCount;i++)
			{
				triangle=[
					this.applyTransformToVertex(this.getVertexByIndex(obj.indexData[i*3],obj.vertexPositionData),obj.mvMatrix),
					this.applyTransformToVertex(this.getVertexByIndex(obj.indexData[i*3+1],obj.vertexPositionData),obj.mvMatrix),
					this.applyTransformToVertex(this.getVertexByIndex(obj.indexData[i*3+2],obj.vertexPositionData),obj.mvMatrix)
				];
				
				if (this.intersectTriangle(out,origin,direction,triangle))
				{
					if (typeof intersection[0]=="undefined"&&out[3]<maxDistance||out[3]<intersection[3])
					{
						vec4.copy(intersection,out);
						objectIndex=index;
						result=true;
					}
				}
			}
		});
		console.log(objectIndex,intersection)
		if (result)
		{
			var hitCoordinates=vec3.create();
			hitCoordinates[0]=intersection[0];
			hitCoordinates[1]=intersection[1];
			hitCoordinates[2]=intersection[2];
			//hitObject=new WGL.Raycast.Hit(objectIndex,hitCoordinates,intersection[3]);
			hitObject.objectId=objectIndex;
			hitObject.hitCoordinates=hitCoordinates;
			hitObject.hitDistance=intersection[3]
		}
		return result;
	}
	getVertexByIndex(index,vertexPositionData)
	{
		var result = vec3.create();
		vec3.copy(result,[vertexPositionData[index*3],vertexPositionData[index*3+1],vertexPositionData[index*3+2]]);
		return result;
	}
	//O - origin, D - direction, tri-triangle, out - vec4 [coords_vec3,w], returns true/false
	intersectTriangle (out, O, D, tri) {
		var edge1=vec3.create(),
			edge2=vec3.create(),
			pvec=vec3.create(),
			tvec=vec3.create(),
			qvec=vec3.create();
			
		var EPSILON =0.000001;
		
		vec3.subtract(edge1,tri[1], tri[0]);
		vec3.subtract(edge2,tri[2], tri[0]);
		
		vec3.cross(pvec,D, edge2);
		var det = vec3.dot(edge1, pvec);
		
		if (det < EPSILON) return false;
		vec3.subtract(tvec,O, tri[0]);
		var u = vec3.dot(tvec, pvec);
		if (u < 0 || u > det) return false;
		vec3.cross(qvec,tvec, edge1);
		var v = vec3.dot(D, qvec);
		if (v < 0 || u + v > det) return false;
		
		var t = vec3.dot(edge2, qvec) / det;
		out[0] = O[0] + t * D[0];
		out[1] = O[1] + t * D[1];
		out[2] = O[2] + t * D[2];
		out[3]=t;
		return true;
	}
	//calculates real vertex coordinates according to its transform (location/scale/rotation)
	applyTransformToVertex(vertex,transform){
		var tmp = vec4.create();
		tmp[0]=vertex[0];
		tmp[1]=vertex[1];
		tmp[2]=vertex[2];
		tmp[3]=1;
		vec4.transformMat4(tmp,tmp,transform);
		return vec3.copy(vec3.create(),tmp);
	}
}
WGL.Raycast.Hit=class Hit{
	constructor(objectId,hitCoordinates,hitDistance,objectName)
	{
		this.objectId=objectId;
		this.objectName=objectName;
		this.hitCoordinates=hitCoordinates;
		this.hitDistance=hitDistance;
	}
}