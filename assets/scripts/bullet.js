const mEmitter = require("mEmitter");
const config = require("config");

//Thang Minh da ia cho nay
//thang tung cung ia cho nay
<<<<<<< HEAD
// test source tree

=======
>>>>>>> ad07096466d270f9e6e59840ea2173d7e1f3451e
cc.Class({
    extends: cc.Component,
    properties: {
        damage: 1,
        speed: 5,
        _gameState: config.gameState.PLAYING,
        _updateGameState: null
    },
    onLoad() {
        this._updateGameState = this.updateGameState.bind(this)
        mEmitter.instance.registerEvent(config.event.UPDATE_GAMESTATE, this._updateGameState)
    },
    updateGameState(data) {
        //Minh
        this._gameState = data
    },
    start() {

    },
    onCollisionEnter: function (other, self) {
        let a = other.node.group == "enemy"
        if (other.node.group == "enemy") {
            this.onBulletKilled()

        }
    },
    onBulletKilled() {
        //Alo alo 
        mEmitter.instance.removeEvent(config.event.UPDATE_GAMESTATE, this._updateGameState)
        this.node.destroy();

    },
    update(dt) {
        if (this._gameState == config.gameState.PLAYING)
            this.node.y += this.speed;
        if (this.node.y >= 460) {
            this.onBulletKilled()
        }
    },
});
