
// then admin clear all db
module.exports = function(obj) {
	obj.laptop.price.min = 1000000;
	obj.laptop.screenDiagonal.min = 1000000;
	obj.laptop.numCores.min = 1000000;
	obj.laptop.frontCamera.min = 1000000;
	obj.laptop.mainCamera.min = 1000000;
	obj.laptop.memory.min = 1000000;
	obj.laptop.ramMemory.min = 1000000;
	obj.laptop.price.max = -1000000;
	obj.laptop.screenDiagonal.max = -1000000;
	obj.laptop.numCores.max = -1000000;
	obj.laptop.frontCamera.max = -1000000;
	obj.laptop.mainCamera.max = -1000000;
	obj.laptop.memory.max = -1000000;
	obj.laptop.ramMemory.max = -1000000;
	obj.tablet.price.min = 1000000;
	obj.tablet.screenDiagonal.min = 1000000;
	obj.tablet.numCores.min = 1000000;
	obj.tablet.frontCamera.min = 1000000;
	obj.tablet.mainCamera.min = 1000000;
	obj.tablet.memory.min = 1000000;
	obj.tablet.ramMemory.min = 1000000;
	obj.tablet.price.max = -1000000;
	obj.tablet.screenDiagonal.max = -1000000;
	obj.tablet.numCores.max = -1000000;
	obj.tablet.frontCamera.max = -1000000;
	obj.tablet.mainCamera.max = -1000000;
	obj.tablet.memory.max = -1000000;
	obj.tablet.ramMemory.max = -1000000;	
	return obj;
}
