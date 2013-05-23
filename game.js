function game() {
	var canvas = document.getElementById('game');
	if (canvas.getContext){
		var ctx = canvas.getContext("2d");
		ctx.fillStyle = "rgb(0,0,0)";
		ctx.fillRect(300,100,200,200);
	}
}