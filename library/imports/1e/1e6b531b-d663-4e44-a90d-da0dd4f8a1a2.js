"use strict";
cc._RF.push(module, '1e6b5Mb1mNORKkN2g3U+KGi', 'game');
// scripts/game.js

"use strict";

var mEmitter = require("./mEmitter");
var config = require("config");

cc.Class({
    extends: cc.Component,

    properties: {
        bg_1: cc.Node,
        bg_2: cc.Node,
        title: cc.Label,
        gamePlaying: cc.Node,
        gamePause: cc.Node,
        gameReady: cc.Node,
        gameOver: cc.Node,

        score: cc.Label,
        scoreOver: cc.Label,

        pre_hero: cc.Prefab,
        _hero: cc.Node,

        pre_creep: cc.Prefab,
        pre_assassin: cc.Prefab,
        pre_motherShip: cc.Prefab,
        pre_bullet: cc.Prefab
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad: function onLoad() {
        mEmitter.instance = new mEmitter();
        //cc.log(config.event.UPDATE_SCORE)
        var manager = cc.director.getCollisionManager();
        manager.enabled = true;
        //manager.enabledDebugDraw = true;
        this.init();
        this.setTouch();

        mEmitter.instance.registerEvent(config.event.UPDATE_SCORE, this.updateScore.bind(this));
        mEmitter.instance.registerEvent(config.event.GAME_OVER, this.gameFinished.bind(this));
    },
    start: function start() {},
    update: function update(dt) {

        this.setBg();
        if (this.gameState == config.gameState.PLAYING) {
            this.bulletTime++;

            if (this.bulletTime == 10) {
                this.bulletTime = 0;
                this.createBullet();
            }

            this.spawnCreeps(dt);
            this.spawnAssassins(dt);
            this.spawnMotherShips(dt);
        }
    },
    init: function init() {
        this.isBgMove = false;
        this.bg_1.y = 0;
        this.bg_2.y = this.bg_1.y + this.bg_1.height;
        this.gameReady.zIndex = 1;
        // this.gameOver.zIndex = -1;
        this.gamePause.zIndex = 2;
        //this.score.zIndex = 3;
        this.gameReady.active = true;
        this.gamePlaying.active = false;
        this.gamePause.active = false;
        this.gameOver.active = false;

        this.bulletTime = 0;
        this.gameState = config.gameState.READY;
        this.score.string = 0;

        this.spawnCreepTime = 0;
        this.spawnAssasinTime = 0;
        this.spawnMotherShipTime = 0;

        this.level = 1;
        this.spawnHero();
    },
    setTouch: function setTouch() {
        this.node.on("touchstart", function (event) {
            this.gameState = config.gameState.PLAYING;
            this.gameReady.active = false;
            this.gamePlaying.active = true;
            //this.gameOver.active = false;
            this.isBgMove = true;
        }, this);
        this.node.on("touchmove", function (event) {
            if (this._hero.name != "") {
                var pos_hero = this._hero.getPosition();
                var pos_mov = event.getDelta();
                var x = pos_hero.x + pos_mov.x;
                var y = pos_hero.y + pos_mov.y;
                if (x < 280 && x > -280) if (y < 400 && y > -400) this._hero.setPosition(cc.v2(x, y));
            }
        }, this);
        this.node.on("touchend", function (event) {
            cc.log("touchend");
        }, this);
    },
    gameFinished: function gameFinished() {
        cc.log("test");
        this.gameState = config.gameState.OVER;
        this.removeAllBullet();
        this.removeAllEnemy();

        this.gameOver.active = true;
        this.scoreOver.string = this.score.string;
    },
    spawnCreeps: function spawnCreeps(dt) {
        this.spawnCreepTime += dt;
        if (this.spawnCreepTime >= 1 / this.level) {
            this.spawnCreepTime = 0;
            this.createEnemy(this.pre_creep, 1);
        }
    },
    spawnAssassins: function spawnAssassins(dt) {
        this.spawnAssasinTime += dt;
        if (this.spawnAssasinTime >= 2 / this.level) {
            this.spawnAssasinTime = 0;
            this.createEnemy(this.pre_assassin, 2);
        }
    },
    spawnMotherShips: function spawnMotherShips(dt) {
        this.spawnMotherShipTime += dt;
        if (this.spawnMotherShipTime >= 5 / this.level) {
            this.spawnMotherShipTime = 0;
            this.createEnemy(this.pre_motherShip, 0.2);
        }
    },
    createEnemy: function createEnemy(pre_enemy, speed) {
        var x = Math.floor(Math.random() * 600) + 1 - 300; // -300 300
        var y = Math.floor(Math.random() * 900) + 1 + 550; // 550 1450
        var enemy = cc.instantiate(pre_enemy);
        var js = enemy.getComponent("enemy");
        js.speed = Math.floor(Math.random() * 2) + speed + this.level;
        enemy.parent = this.node;
        enemy.setPosition(cc.v2(x, y));
    },
    spawnHero: function spawnHero() {
        this._hero = cc.instantiate(this.pre_hero);
        this._hero.parent = this.node;
        this._hero.setPosition(cc.v2(0, -300));
    },
    updateScore: function updateScore(score) {
        //cc.log("tets")
        this.score.string = Number(this.score.string) + score;
        this.updateLevel();
    },
    updateLevel: function updateLevel() {
        this.level = Math.floor(this.score.string / 50) + 1;
    },
    setBg: function setBg() {
        if (this.isBgMove) {
            this.bg_2.y -= 0.5;
            this.bg_1.y -= 0.5;
            if (this.bg_1.y <= -this.bg_1.height) this.bg_1.y = this.bg_2.y + this.bg_1.height;
            if (this.bg_2.y <= -this.bg_2.height) this.bg_2.y = this.bg_1.y + this.bg_2.height;
        }
    },
    createBullet: function createBullet() {
        if (this._hero.name != "") {
            var pos = this._hero.getPosition();
            var bullet = cc.instantiate(this.pre_bullet);
            bullet.parent = this.node;
            bullet.setPosition(cc.v2(pos.x, pos.y + this._hero.height / 2));
        }
    },
    removeAllBullet: function removeAllBullet() {
        var children = this.node.children;
        for (var i = children.length - 1; i >= 0; i--) {
            var bullet = children[i].getComponent("bullet");
            if (bullet) bullet.onBulletKilled();
        }
    },
    removeAllEnemy: function removeAllEnemy() {
        var children = this.node.children;
        for (var i = children.length - 1; i >= 0; i--) {
            var enemy = children[i].getComponent("enemy");
            if (enemy) enemy.onEnemyKilled();
        }
    },
    removeHero: function removeHero() {
        var children = this.node.children;
        for (var i = children.length - 1; i >= 0; i--) {
            var enemy = children[i].getComponent("hero");
            if (enemy) {
                enemy.onHeroKilled();
            }
        }
    },
    clickBtn: function clickBtn(sender, str) {
        switch (str) {
            case "resume":
                cc.log("resume");
                this.isBgMove = true;
                this.gamePause.active = false;
                this.gamePlaying.active = true;
                this.gameState = config.gameState.PLAYING;
                mEmitter.instance.emit(config.event.UPDATE_GAMESTATE, this.gameState);
                break;
            case "pause":
                cc.log("pause");
                //this.gameReady.active = false;
                //this.gamePlaying.active = false;
                this.gamePause.active = true;
                //this.gameOver.active = false;
                this.isBgMove = false;
                this.gameState = config.gameState.PAUSE;
                mEmitter.instance.emit(config.event.UPDATE_GAMESTATE, this.gameState);
                break;
            case "restart":
                cc.log("restart");
                //this.gameOver.active = false;
                this.gameState = config.gameState.READY;
                this.removeAllBullet();
                this.removeAllEnemy();
                this.removeHero();
                this.init();
                break;
        }
    }
});

cc._RF.pop();