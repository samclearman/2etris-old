/****************************
*                           *
*   Scoreboard class        *
*                           *
****************************/

function scoreboard(score) {
    this.score = score || 0;
    this.multiplier = 1;
    this.highscore = parseInt(localStorage.getItem("highscore"));
    this.highscore = this.highscore || 0;
    this.add(0);
}

scoreboard.prototype.add = function(pts) {
    this.score += Math.floor(pts * this.multiplier);
    document.getElementById("score").textContent = this.score;

    if (this.score > this.highscore) {
        this.highscore = this.score;
        localStorage.setItem("highscore", this.highscore);
    }
    document.getElementById("high_score").textContent = this.highscore;
};
