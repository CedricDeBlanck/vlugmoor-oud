import { default as mongoose, Schema, Document, PaginateModel } from 'mongoose';
import { default as mongoosePaginate } from 'mongoose-paginate';
import { default as slug } from 'slug';
import { IUser } from './user.model';

interface IMetaData extends Document {
  title: string;
  description: string;

  picture: string;
  date: Date;

  slug: string;

  _createdAt: number;
  _modifiedAt: number;
  _deletedAt: number;

  _userId: IUser['_id'];
  slugify(): void;
}

interface IMetaDataModel extends PaginateModel<IMetaData> {}

const metaDataSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
      max: 128,
    },
    description: {
      type: String,
      required: true,
      max: 2056,
    },
    picture: {
      type: String,
      required: false,
    },
    date: {
      type: Date,
      required: true,
    },
    slug: {
        type: String,
        required: false,
        lowercase: true,
        unique: false,
    },
    _createdAt: {
      type: Number,
      required: false,
      default: Date.now(),
    },
    _modifiedAt: {
      type: Number,
      required: false,
      default: null,
    },
    _deletedAt: {
      type: Number,
      required: false,
      default: null,
    },
    _userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

metaDataSchema.methods.slugify = function() {
  this.slug = slug(this.title);
};

metaDataSchema.pre<IMetaData>('validate', function(next) {
    if (!this.slug) {
      this.slugify();
    }
    return next();
});

metaDataSchema.virtual('id').get(function(this: IMetaData) {
  return this._id;
});

metaDataSchema.virtual('user', {
  ref: 'User',
  localField: '_userId',
  foreignField: '_id',
  justOne: false,
});

metaDataSchema.plugin(mongoosePaginate);
const MetaData = mongoose.model<IMetaData, IMetaDataModel>(
  'metaData',
  metaDataSchema,
);

export { IMetaData, IMetaDataModel, MetaData, metaDataSchema };
