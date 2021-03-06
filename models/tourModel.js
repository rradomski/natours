const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Must have name'],
    unique: true,
    trim: true,
    maxlength: [40, 'Name is too long'],
    minlength: [10, 'Name is too short']
  },
  slug: {
    type: String
  },
  duration: {
    type: Number,
    required: [true, 'Must have duration']
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'Must have maxGroupSize']
  },
  difficulty: {
    type: String,
    required: [true, 'Must have difficulty'],
    enum: {
      values: ['easy', 'medium', 'difficult'],
      message: 'Difficulty must have one of these values: easy, medium, difficult'
    }
  },
  ratingsAverage: {
    type: Number,
    default: 4.5,
    min: [1, 'Must be higher or equal 1'],
    max: [5, 'Must be lower or equal 5'],
    set: value => Math.round(value * 10) / 10,
    get: value => Math.round(value * 10) / 10
  },
  ratingsQuantity: {
    type: Number,
    default: 0
  },
  price: {
    type: Number,
    required: [true, 'Must have price']
  },
  priceDiscount: {
    type: Number,
    validate: {
      validator: function(val) {
        return val < this.price;
      },
      message: 'Discount must be lover than price now its {VALUE}'
    }
  },
  summary: {
    type: String,
    trim: true,
    required: [true, 'Must have summary']
  },
  description: {
    type: String,
    trim: true
  },
  imageCover: {
    type: String,
    required: [true, 'Must have imageCover']
  },
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false
  },
  startDates: [Date],
  secretTour: {
    type: Boolean,
    default: false
  },
  startLocation: {
    type: {
      type: String,
      default: 'Point',
      enum: ['Point']
    },
    coordinates: [Number],
    address: String,
    description: String
  },
  locations: [
    {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      address: String,
      description: String,
      dat: Number
    }
  ],
  guides: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }
  ]
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere'});

tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7;
});

tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id'
});

tourSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

tourSchema.pre(/^find/, function(next) {
  this.find({ secretTour: { $ne: true } });

  this.start = Date.now();
  next();
}, error => {
  console.error(error.message);
});

tourSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt'
  });

  next();
});

tourSchema.post(/^find/, function(docs, next) {
  console.log(`Query to DB took ${Date.now() - this.start} milliseconds`);
  next();
});

tourSchema.pre('aggregate', function(next) {
  const pipeline = this.pipeline();
  let el;
  pipeline.forEach((val, index) => {
    if (val['$geoNear']) [el] = pipeline.splice(index, 1);
  });
  pipeline.unshift({ $match: { secretTour: { $ne: true } } });
  if (el) pipeline.unshift(el);
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
