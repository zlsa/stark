
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

      this.max_rate = {
        output: 0,
        input:  0
      };

      this.rate = {
        output: 0,
        input:  0
      };

    },
    parse: function(data) {
      base.parse.call(this, data);

      if(data.type) {
        this.type = data.type;
      }

    },
    isEmpty: function() {
      return (this.getAmount() < 0.01);
    },
    updateFuel: function() {
      this.rate.output = clamp(0, this.rate.output, this.max_rate.output);
      this.rate.input  = clamp(0, this.rate.input,  this.max_rate.input);
      this.flow = -this.rate.output + this.rate.input;
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
    "xenon": {
      weight:  0.05,
      element: "Xe"
    },
    "hydrogen": {
      weight: 0.015,
      element: "H"
    }
  };
}
