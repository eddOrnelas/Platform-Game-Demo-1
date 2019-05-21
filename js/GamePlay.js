/* global MainGameContainer */
MainGameContainer.GamePlay = function (game) {};

MainGameContainer.GamePlay.prototype = {
  // Game Objects or Groups
  bgMusic: undefined,
  player: {
    obj: {},
    state: 'idle',
    status: 'simple',
    direction: 'right',
    damageTransition:  false,
  },
  enemies: {
  	goombas: undefined,
  },
  coins: [],
  items: [],
  platforms: undefined,
  CONSTANTS: {

  },
  buttons: {
  	cursors: undefined,
  	jumpButton: undefined,
  },
  ui: {
  	coinsLabel: undefined,
  	timeLabel: undefined,
  	scoreLabel: undefined,
  	livesLabel: undefined,
  },
  sounds: {
  	coin: undefined,
  },
  gameState: 'preparing',
  jumpTimer: 0,
  coinsCount: 0,
  scoreCount: 0,
  timeCount: 120,
  livesCount: 3,
  touchedCount: 0,
  pauseRefreshCounter: 0,

  preload: function () {

  },
  shutdown: function() {
    this.game.world.removeAll();
    // reset everything
    this.resetAll();
  },
	create: function () {
		// Enable Global Phisics
		this.game.physics.startSystem(Phaser.Physics.ARCADE);
		
		// set game world size
		this.game.world.setBounds(0,0, 1960, 360);
		
	  // BG image
	  // this.mainMenuBackground = this.add.sprite(0, 0, 'game_bg');
    
    // init game objects
    this.initGameObjets();

	  // player controller for update behavior
	  this.buttons.cursors = this.game.input.keyboard.createCursorKeys();
    this.buttons.jumpButton = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    
    // simple keystrockes not need to check on update
    this.game.input.keyboard.addCallbacks(this,this.onKeyDown);
    
    // set camera
    this.game.camera.follow(this.player.obj);
    
    // init sounds
    this.initSounds();
    
    // init ui
	  this.addUIElements();
    
	  this.startGame();
	},
	update: function () {
		var pauseGameplay = false;
		if (this.player.status === 'going_super'
		|| this.player.status === 'going_simple'
		|| this.player.status === 'died') {
			pauseGameplay = true;
			this.game.physics.arcade.isPaused = true;
		} else {
			pauseGameplay = false;
			this.game.physics.arcade.isPaused = false;
		}
		// game logic
		var self = this;
		if (!pauseGameplay) {
			// manage collisions first ALWAYS!!
			this.game.physics.arcade.collide(this.player.obj, this.platforms, function(player, platform) {self.platformCollisions(player, platform, self);});
			this.game.physics.arcade.overlap(this.player.obj, this.coins, function(player, coin) {self.coinsCollisions(player, coin, self);});
			
			if (!this.player.damageTransition) {
				this.game.physics.arcade.collide(this.player.obj, this.enemies, function(player, enemy) {self.playerEnemyCollisions(player, enemy, self);});
			} else {
				this.game.physics.arcade.overlap(this.player.obj, this.enemies, function(player, enemy) {self.playerEnemyCollisions(player, enemy, self);});
			}
			
			
			this.game.physics.arcade.collide(this.enemies, this.platforms, function(enemy, platform) {self.enemyPlatformCollisions(enemy, platform, self)});
			
			this.game.physics.arcade.collide(this.enemies, this.enemies, function(enemy1, enemy2) {self.enemyEnemyCollisions(enemy1, enemy2, self)});
			this.game.physics.arcade.collide(this.items, this.platforms);
			this.game.physics.arcade.collide(this.player.obj, this.items, function(player, item) {self.playerItemsCollisions(player, item, self)});
			
			// manage other logic
			this.playerController();
			this.enemiesLogic();
			this.itemsLogic();
			
			if (this.timeCount <= 0) {
				this.playerDie();
				this.sounds.hit.play();
			}
		}
		
		this.updateUI();
	},

	initGameObjets() {
		
		// init player
		this.initPlayer();
		
		// set world gravity
		this.game.physics.arcade.gravity.y = 600;
		
		// init items layer (so items can raise "inside" blocks)
		this.items = this.add.group();
		
		// init other objects
		this.initGameWorldPlatforms();
		this.initGameWorldEnemies();
		this.initGameWorldItems();
	},
	initPlayer() {
		// init player
		this.player.obj = this.game.add.sprite(0, 260, 'block_32x32');
		this.player.obj.tint = 0x0000ff;
		this.player.status = 'simple';
		this.player.state = 'idle';
		
		// enable player physics
		this.game.physics.arcade.enable(this.player.obj);
		this.player.obj.enableBody = true;
		
		// set player collider sizes
		this.player.obj.body.setSize(24, 32, 4, 0);
		
		// set player from falling off screen
		this.player.obj.body.collideWorldBounds = true;
	},
	initGameWorldPlatforms() {
		//init platforms
		this.platforms = this.add.physicsGroup();
		this.platforms.enableBody = true;

		// add platforms to game
		// i know it's little dirty, this is for the sake of new coders or people are learning
		// we can simplify like this.platforms.create(0, 328, 'platform_320x32').type = 'ground'
		var block = this.platforms.create(0, 328, 'block_320x32');
		block.type = 'ground';
		var block = this.platforms.create(320, 328, 'block_320x32');
		block.type = 'ground';
		var block = this.platforms.create(640, 328, 'block_320x32');
		block.type = 'ground';
		var block = this.platforms.create(960, 328, 'block_320x32');
		block.type = 'ground';
		var block = this.platforms.create(1280, 328, 'block_320x32');
		block.type = 'ground';
		var block = this.platforms.create(1600, 328, 'block_320x32');
		block.type = 'ground';
		
		
		var block = this.platforms.create(736, 232, 'block_32x32');
		block.type = 'mushrom_block';

		var block = this.platforms.create(800, 232, 'block_32x32');
		block.type = 'block';
		var block = this.platforms.create(832, 232, 'block_32x32');
		block.type = 'coin_block';
		var block = this.platforms.create(864, 232, 'block_32x32');
		block.type = 'block';
		var block = this.platforms.create(896, 232, 'block_32x32');
		block.type = 'coin_block';
		var block = this.platforms.create(928, 232, 'block_32x32');
		block.type = 'block';
		
		var block = this.platforms.create(832, 136, 'block_32x32');
		block.type = 'block';
		var block = this.platforms.create(864, 136, 'block_32x32');
		block.type = 'coin_block';
		var block = this.platforms.create(896, 136, 'block_32x32');
		block.type = 'block';
		
		var block = this.platforms.create(1216, 232, 'block_32x32');
		block.type = 'coin_block';
		var block = this.platforms.create(1280, 166, 'block_64x160');
		block.type = 'pipe';
		
		var block = this.platforms.create(1588, 296, 'block_32x32');
		block.type = 'block';
		var block = this.platforms.create(1588, 264, 'pole_32x32');
		block.type = 'pole';
		var block = this.platforms.create(1588, 232, 'pole_32x32');
		block.type = 'pole';
		var block = this.platforms.create(1588, 200, 'pole_32x32');
		block.type = 'pole';
		var block = this.platforms.create(1588, 168, 'pole_32x32');
		block.type = 'pole';
		var block = this.platforms.create(1588, 136, 'pole_32x32');
		block.type = 'pole';
		var block = this.platforms.create(1588, 104, 'pole_32x32');
		block.type = 'pole';
		var block = this.platforms.create(1588, 72, 'pole_32x32');
		block.type = 'pole';
		
		this.platforms.forEach(function(platform) {
			switch (platform.type) {
				case 'ground':
					platform.tint = 0xec4707;
					break;
				case 'block':
					platform.tint = 0x886d03;
					break;
				case 'coin_block':
					platform.tint = 0xf3eb04;
					break;
				case 'mushrom_block':
					platform.tint = 0xf3eb04;
					break;
				case 'pipe':
					platform.tint = 0x00FF00;
					break;
			}
		});
		
		// set plaforms properties
		this.platforms.setAll('body.allowGravity', false);
		this.platforms.setAll('body.immovable', true);
	},
	initGameWorldEnemies() {
		// add enemies
		this.enemies = this.add.physicsGroup();
		this.enemies.enableBody = true;
		
		var enemy = this.enemies.create(800, 280, 'block_32x32');
		enemy.type = 'goomba';
		enemy.directionString = 'left';
		
		var enemy = this.enemies.create(890, 280, 'block_32x32');
		enemy.type = 'turtle';
		enemy.directionString = 'left';
		enemy.state = 'out';
		
		var enemy = this.enemies.create(1500, 280, 'block_32x32');
		enemy.type = 'goomba';
		enemy.directionString = 'left';
		
		var enemy = this.enemies.create(1590, 280, 'block_32x32');
		enemy.type = 'turtle';
		enemy.directionString = 'left';
		enemy.state = 'out';
		
		
		this.enemies.forEach(function(enemy) {
			switch (enemy.type) {
				case 'goomba':
					enemy.tint = 0xca0909;
					break;
					
				case 'turtle':
					enemy.tint = 0x348007;
					// enemy.tint = 0x53ce0b;
					break;
			}
		})
		
	},
	initGameWorldItems() {
		this.coins = this.add.physicsGroup();
		this.coins.enableBody = true;
		
		var coin = this.coins.create(100, 300, 'coin');
		
		this.coins.setAll('body.allowGravity', false);
		this.coins.setAll('body.immovable', true);
	},
	initSounds() {
		this.sounds.coin = this.game.add.audio('coin');
		this.sounds.smash = this.game.add.audio('confirm');
		this.sounds.hit = this.game.add.audio('error');
		this.sounds.mushrom = this.game.add.audio('loadsave');
	},
	startGame() {
	  this.gameState = 'playing';
	  
	  // game music
	  this.bgMusic = this.game.add.audio('blue_beat');
    this.bgMusic.volume = 0.2;
    this.bgMusic.loop = true;
    this.bgMusic.play();
    
    var self = this;
    self.game.time.events.loop(Phaser.Timer.SECOND, function() {
    	if (!(self.player.status === 'going_super'
				|| self.player.status === 'going_simple'
				|| self.player.status === 'died'))
			self.timeCount -= 1;
		}, self);
	},
	onKeyDown(e) {
		switch(e.keyCode){
			// left
			case 37:
				// this.movePlayer('left');
			break;
			default:
				// this.movePlayer('default');
			break;
		}
	},
	addUIElements() {
		// set text label style
		var style = {
			font: '16px Arial',
			fill: '#FFFFFF',
			align: 'center',
			stroke: '#000000',
			strokeThickness: 2,
		};
		
		// add labels/texts
		this.ui.coinsLabel = this.game.add.text(5, 5, 'Coins:\n' + this.coinsCount, style);
		this.ui.coinsLabel.fixedToCamera = true;
		this.ui.scoreLabel = this.game.add.text(150, 5, 'Score:\n' + this.scoreCount, style);
		this.ui.scoreLabel.fixedToCamera = true;
		this.ui.livesLabel = this.game.add.text(300, 5, 'Lives:\n' + this.livesCount, style);
		this.ui.livesLabel.fixedToCamera = true;
		this.ui.timeLabel = this.game.add.text(450, 5, 'Time Left:\n' + this.timeCount, style);
		this.ui.timeLabel.fixedToCamera = true;
	},
	updateUI() {
		this.ui.coinsLabel.setText('Coins:\n' + this.coinsCount);
		this.ui.scoreLabel.setText('Score:\n' + this.scoreCount);
		this.ui.livesLabel.setText('Lives:\n' + this.livesCount);
		this.ui.timeLabel.setText('Time Left:\n' + this.timeCount);
	},
	playerController() {
		if (this.buttons.cursors.left.isDown) {
			this.movePlayer('left');
		} else if (this.buttons.cursors.right.isDown) {
			this.movePlayer('right');
		} else {
			this.movePlayer('idle');
		}
		
		// if button down is pressed
		// and player is touching ground or touching another enemy
		// and fail safe jumptimer is lesser than delta time
		if (this.buttons.jumpButton.isDown && (this.player.obj.body.onFloor()
		|| this.player.obj.body.touching.down) && this.game.time.now > this.jumpTimer) {
				this.jumpTimer = this.game.time.now + 350;
        this.movePlayer('jump');
    }
	},
	enemiesLogic() {
		var self = this;
		this.enemies.forEach(function(enemy) {
			switch (enemy.type) {
				case 'goomba':
					if (enemy.directionString === 'left') {
						enemy.body.velocity.x = -100;
					} else if (enemy.directionString === 'right'){
						enemy.body.velocity.x = 100;
					}
					break;
					
				case 'turtle':
					if (enemy.state === 'curled_moving') {
						if (enemy.directionString === 'left') {
							enemy.body.velocity.x = -300;
						} else if (enemy.directionString === 'right') {
							enemy.body.velocity.x = 300;
						}
					} else if (enemy.state === 'out') {
						if (enemy.directionString === 'left') {
							enemy.body.velocity.x = -100;
						} else if (enemy.directionString === 'right') {
							enemy.body.velocity.x = 100;
						}
					} else if (enemy.state === 'curled_idle') {
						enemy.body.velocity.x = 0;
					}
				break;
			}
		});
	},
	itemsLogic() {
		this.items.forEach(function(item) {
			if (item.state === 'moving') {
				if (item.directionString === 'left') {
					item.body.velocity.x = 150;
				} else if (item.directionString === 'right') {
					item.body.velocity.x = -150;
				} else {
					item.body.velocity.x = 0;
				}
			}
		});
	},
	movePlayer(direction) {
		if(this.gameState === 'playing'){
			if (direction === 'right') {
				this.player.obj.body.velocity.x = 250;
				this.player.directionString = 'right';
			} else if (direction === 'left') {
				this.player.obj.body.velocity.x = -250;
				this.player.directionString = 'left';
			} else if (direction === 'idle') {
				this.player.obj.body.velocity.x = 0;
			} else if (direction === 'jump') {
				this.player.obj.body.velocity.y = -350;
			}
		}
	},
	platformCollisions(player, platform, self) {
		if (platform.body.touching.down && player.body.touching.up) {
			if (platform.type === 'block') {
				platform.destroy();
			} else if (platform.type === 'coin_block') {
				platform.type = 'block_used';
				platform.tint = 0x612c04;
				self.coinsCount += 1;
				self.sounds.coin.play();
			} else if (platform.type === 'mushrom_block') {
				platform.type = 'block_used';
				platform.tint = 0x612c04;
				self.sounds.mushrom.play();
				self.createItem(platform.x, platform.y, 'mushrom', player.directionString);
			}
		}
	},
	coinsCollisions(player, coin, self) {
		self.coinsCount += 1;
		self.sounds.coin.play();
		coin.destroy();
	},
	playerEnemyCollisions(player, enemy, self) {
		switch (enemy.type) {
				case 'goomba':
					if (enemy.body.touching.up && player.body.touching.down) {
						player.body.velocity.y -= 300;
						enemy.destroy();
						self.sounds.smash.play();
						self.scoreCount += 100;
					} else if (((enemy.body.touching.left && player.body.touching.right)
					|| (enemy.body.touching.right && player.body.touching.left))
					&& !self.player.damageTransition) {
						if (self.player.status === 'super' && self.player.damageTransition === false) {
							self.turnPlayer('simple');
							self.sounds.hit.play();
						} else if (self.player.status === 'simple' && self.player.damageTransition === false) {
							self.livesCount -= 1;
							self.playerDie();
						self.sounds.hit.play();
						}
					}
				break;
					
				case 'turtle':
					if (enemy.body.touching.up && player.body.touching.down) {
						player.body.velocity.y -= 300;
						if (enemy.state === 'out') {
							enemy.tint = 0x53ce0b;
							enemy.state = 'curled_idle';
							self.sounds.smash.play();
							self.scoreCount += 100;
						} else if (enemy.state === 'curled_idle') {
							enemy.state = 'curled_moving';
							if (player.x <= enemy.x) {
								enemy.directionString = 'right';
							} else if (player.x > enemy.x) {
								enemy.directionString = 'left';
							}
							self.sounds.smash.play();
							self.scoreCount += 100;
						} else if (enemy.state === 'curled_moving') {
							enemy.state = 'curled_idle';
							self.sounds.smash.play();
							self.scoreCount += 100;
						}
					} else if (((enemy.body.touching.left && player.body.touching.right)
					|| (enemy.body.touching.right && player.body.touching.left))
					&& !self.player.damageTransition) {
						if (enemy.state === 'curled_idle') {
							enemy.state = 'curled_moving';
							if (enemy.body.touching.left) {
								enemy.directionString = 'right';
							} else if (enemy.body.touching.right) {
								enemy.directionString = 'left';
							}
							self.sounds.smash.play();
							self.scoreCount += 100;
						} else if (enemy.state === 'curled_moving' || enemy.state === 'out') {
							if (self.player.status === 'super') {
								self.turnPlayer('simple');
								self.sounds.hit.play();
							} else if (self.player.status === 'simple') {
								self.livesCount -= 1;
								self.playerDie();
								self.sounds.hit.play();
							}
						}
					}
					break;
				
				default:
					// code
			}
	},
	enemyPlatformCollisions(enemy, platform, self) {
		if (enemy.body.touching.left && platform.body.touching.right) {
			enemy.directionString = 'right';
		} else if (enemy.body.touching.right && platform.body.touching.left) {
			enemy.directionString = 'left';
		}
	},
	enemyEnemyCollisions(enemy1, enemy2, self) {
		if (enemy1.type === 'turtle' && enemy1.state === 'curled_moving') {
			enemy2.destroy();
			return true;
		} else if (enemy2.type === 'turtle' && enemy2.state === 'curled_moving') {
			enemy1.destroy();
			return true;
		}
		
		if (enemy1.body.touching.left) {
			enemy1.directionString = 'right';
		} else if (enemy1.body.touching.right) {
			enemy1.directionString = 'left';
		}
		
		if (enemy2.body.touching.left) {
			enemy2.directionString = 'right';
		} else if (enemy2.body.touching.right) {
			enemy2.directionString = 'left';
		}
	},
	playerItemsCollisions(player, item, self) {
		if (item.type === 'mushrom') {
			item.destroy();
			self.sounds.coin.play();
			self.turnPlayer('super');
		}
		
		if (item.type === 'mushrom_1up') {
			item.destroy();
			self.sounds.coin.play();
			self.livesCount += 1;
		}
	},
	
	createItem(x, y, itemName, direction) {
		
		if (itemName === 'mushrom') {
			var mushrom = this.items.create(x, y, 'block_32x32');
			mushrom.type = itemName;
			mushrom.tint = 0x928844;
			mushrom.state = 'rising';
			mushrom.directionString = direction === 'left' ? direction : 'right';
			
			var tween = this.game.add.tween(mushrom).to({ y: (y-32)}, 1000);
			var self = this;
			tween.onComplete.add(function() {
				self.game.physics.arcade.enable(mushrom);
				mushrom.state = 'moving';
				mushrom.body.setSize(24, 32, 4, 0);
				mushrom.enableBody = true;
			}, this);
			tween.start();
		}
		
		if (itemName === 'mushrom_1up') {
			var mushrom = this.items.create(x, y, 'block_32x32');
			mushrom.type = itemName;
			mushrom.tint = 0x19882c;
			mushrom.state = 'rising';
			mushrom.directionString = direction === 'left' ? direction : 'right';
			
			var tween = this.game.add.tween(mushrom).to({ y: (y-32)}, 1000);
			var self = this;
			tween.onComplete.add(function() {
				self.game.physics.arcade.enable(mushrom);
				mushrom.state = 'moving';
				mushrom.body.setSize(24, 32, 4, 0);
				mushrom.enableBody = true;
			}, this);
			tween.start();
		}
		
		
	},
	playerDie() {
		this.player.status = 'died';
		var playerC = this.player.obj;
		var tween = this.game.add.tween(this.player.obj).to({y: [(playerC.y - 32), (playerC.y + 64)]}, 1000);
		tween.start();
	},
	
	handleRestarClick() {
	  // remove handlers and reset
	  // this.game.state.clearCurrentState();
	  this.bgMusic.stop();
	  this.game.state.restart(true,false);
	},
	handleReturnToMenuClick() {
	  // remove handlers and reset
	  // this.game.state.clearCurrentState();
	  this.bgMusic.stop();
	  this.game.state.start('GameMainMenu',true,false);
	},
	turnPlayer(status) {
		var self = this;
		self.player.status = 'going_' + status;
		if (status === 'super') {
			self.player.obj.loadTexture('block_32x64');
			self.player.obj.body.setSize(24, 64, 4, 0);
			self.player.obj.y -= 33;
		} else if (status === 'simple') {
			self.player.obj.loadTexture('block_32x32');
			self.player.obj.body.setSize(24, 32, 4, 0);
			self.player.obj.y += 32;
			self.player.damageTransition = true;
		}

		var tween = this.game.add.tween(self.player.obj).to({alpha: [0.5, 1, 0.5, 1, 0.5, 1]}, 1000);
		
		if (status === 'simple') {
			tween.onComplete.add(function() {
				var tween2 = self.game.add.tween(self.player.obj).to({alpha: [0.5, 1, 0.5, 1, 0.5, 1]}, 1500);
				tween2.onComplete.add(function() {
					self.player.damageTransition = false;
				});
				tween2.start();
			}, this);
		}
		
		tween.start();

		this.game.time.events.repeat(Phaser.Timer.SECOND, 1, function() {
			this.player.status = status;
		}, this);
	},
	resetAll() {
    this.player = {
      obj: {},
      posX: 0,
      posY: 0,
      state: 'idle',
      status: 'active',
    };
    this.CONSTANTS = {};
    this.gameState = 'preparing';
    this.jumpTimer = 0;
    this.coinsCount = 0;
    this.player = {
	    obj: {},
	    state: 'idle',
	    status: 'active',
	  };
  	this.enemies = [];
  	this.coins = [];
  	this.platforms = undefined;
    
	},
	render() {
		// this.game.debug.body(this.player.obj);
		// this.game.debug.body(this.plaforms);
		this.game.debug.text( "This is debug text", 100, 380 );
	},
};
