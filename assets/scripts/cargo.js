
var Expendable = Fiber.extend(function() {
  return {
    init: function(options) {
      if(!options) options={};
      
      this.amount     = 0;
      this.capacity   = 0;

      this.can_hold   = {};

      this.weight     = 0;

      this.flow       = 0;

      this.parse(options);
    },
    parse: function(data) {
      if(data.amount) {
        this.amount = data.amount;
      }

      if(data.capacity) {
        this.capacity = data.capacity;
      }

      if(data.can_hold) {
        this.can_hold = data.can_hold;
      }

      if(data.weight) {
        this.weight = data.weight;
      }

    },
    fill: function() {
      this.amount = this.capacity;
    },
    set: function(fraction) {
      this.amount = this.capacity * fraction;
    },
    getAmount: function() {
      return this.amount;
    },
    getFraction: function() {
      return this.amount / this.capacity;
    },
    getWeight: function() {
      return this.amount * this.weight;
    },
    updateFlow: function() {
      this.amount += this.flow * game_delta();

      this.amount = clamp(0, this.amount, this.capacity);
    },
    update: function() {
      this.updateFlow();
    }
  };
});

var FuelTank = Expendable.extend(function(base) {
  return {
    init: function(options) {
      if(!options) options={};

      base.init.call(this, options);

      this.type = "xenon";

      this.max_rate = {
        output: 0,
        input:  0
      };

      this.rate = {
        output: 0,
        input:  0,
      };

      this.lowpass = {
        output: new Lowpass(0.1),
        input:  new Lowpass(0.1),
      };

    },
    parse: function(data) {
      base.parse.call(this, data);

      if(data.type) {
        this.type = data.type;
      }

    },
    isEmpty: function() {
      return (this.getFraction() < 0.0001);
    },
    isFull: function() {
      return (this.getFraction() > 0.9999);
    },
    updateFuel: function() {
      this.rate.output = clamp(0, this.rate.output, this.max_rate.output) * prop.cargo.fuels[this.type].loss;
      this.rate.input  = clamp(0, this.rate.input,  this.max_rate.input);

      if(this.isFull())  this.rate.input  = 0;
      if(this.isEmpty()) this.rate.output = 0;

      this.flow = -this.rate.output + this.rate.input;

      this.lowpass.output.target = this.rate.output;
      this.lowpass.input.target  = this.rate.input;

      this.lowpass.output.tick(game_delta());
      this.lowpass.input.tick(game_delta());
    },
    update: function() {
      this.updateFuel();
      base.update.call(this);
    }
  };
});


/* CARGO */

var CargoItem = Fiber.extend(function() {
  return {
    init: function(options) {
      if(!options) options={};
      
      this.name       = "";
      this.amount     = 0;
      
      this.parse(options);
    },
    parse: function(data) {

      if(data.name) {
        this.name = data.name;
      }

      if(data.amount) {
        this.amount = data.amount;
      }

    },
    getAmount: function() {
      return this.amount;
    },
    getFraction: function() {
      return this.amount / this.capacity;
    },
    getWeight: function() {
      return this.amount * this.weight;
    },
    update: function() {
      
    }
  };
});

var Cargo = Fiber.extend(function() {
  return {
    init: function(options) {
      if(!options) options={};
      
      this.items      = [];
      this.capacity   = 0;
      
      this.weight     = 0;

      this.parse(options);
    },
    parse: function(data) {
      if(data.items) {
        for(var i=0;i<data.items.length;i++) {
          this.items.push(new CargoItem(data.items[i]));
        }
      }

      if(data.capacity) {
        this.capacity = data.capacity;
      }

      if(data.weight) {
        this.weight = data.weight;
      }

    },
    getAmount: function() {
      return this.amount;
    },
    getFraction: function() {
      return this.amount / this.capacity;
    },
    getWeight: function() {
      return this.amount * this.weight;
    },
    update: function() {
      
    }
  };
});

function cargo_init_pre() {
  prop.cargo = {};

  prop.cargo.fuels = {
    "argon": {
      weight:  0.03,
      loss: 2,
      element: "Ar"
    },
    "xenon": {
      weight:  0.05,
      loss: 1,
      element: "Xe"
    },
    "hydrogen": {
      weight: 0.015,
      loss: 1,
      element: "H"
    }
  };
}
