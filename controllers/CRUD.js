const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");


class CRUDAPI {
  constructor(Model) {
    this.Model = Model;
  }
  
  noId(next) {
    next(new AppError("No data found with that ID or incorrect ID", 400));
  }
  
  createData() {
    return catchAsync(async (req, res, next) => {
      const data = await this.Model.create(req.body);
      
      return res.status(201).json({
        status: "success",
        data
      });
    });
  }
  
  getAllData(populate) {
    return catchAsync(async (req, res, next) => {
      const data = await this.Model.find();
      //.select("+qrCodeLink");
      
      if (!data) return this.noId(next);
      const reqQuery = { ...req.query };

      // Fields to exclude from results
      const removeFields = ['select', 'sort', 'page', 'limit'];
      removeFields.forEach(param => delete reqQuery[param]);

      // Create Mongoose query with MongoDB operators ($gt, $lt, etc.)
      let queryString = JSON.stringify(reqQuery);
      queryString = queryString.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

      let query = this.Model.find(JSON.parse(queryString));

      // Select Fields
      if (req.query.select) {
        const fields = req.query.select.split(',').join(' ')
        query = query.select(fields);
      }

      // Sort Fields
      if (req.query.sort) {
        const fields = req.query.sort.split(',').join(' ')
        query = query.sort(fields);
      } else query = query.sort('-name');

      // Pagination
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      const total = await this.Model.countDocuments();

      query = query.skip(startIndex).limit(limit);
      if (populate) query = query.populate(populate);

      const results = await query;

      // Paginate result
      const pagination = {}

      if (endIndex < total) (pagination.next = { page: page + 1, limit })
      if (startIndex > 0) (pagination.prev = { page: page - 1, limit })

      return res.status(200).json({
        status: 'success',
        count: results.length,
        pagination,
        data: results
      });
    });
  }
  
  getData() {
    return catchAsync(async (req, res, next) => {
      const {id} = req.params;
      const data = await this.Model.findById(id);
      
      if(!data) {
        return this.noId(next);
      }
      
      return res.status(200).json({
        status: "success",
        data
      });
    });
  }
  
  getRelatedData() {
    return catchAsync(async (req, res, next) => {
      const {conversationId} = req.params;
      const data = await this.Model.find({conversationId});
      
      if(!data) {
        return this.noId(next);
      }
      
      return res.status(200).json({
        status: "success",
        length: data.length,
        data
      });
    });
  }
  
  updateData() {
    return catchAsync(async (req, res, next) => {
      const {id} = req.params;
      const data = await this.Model.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidator: true
      });
      
      if(!data) {
        return this.noId(next);
      }
      
      return res.status(200).json({
        status: "success",
        data
      });
    });
  }
  
  deleteData() {
    return catchAsync(async (req, res, next) => {
      const {id} = req.params;
      const data = await this.Model.findByIdAndDelete(id);
      
      if(!data) {
        return this.noId(next);
      }
      
      return res.status(200).json({
        status: "success",
        data
      });
    });
  }
}

module.exports = CRUDAPI;