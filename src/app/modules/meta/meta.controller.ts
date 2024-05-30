import { metaServices } from './meta.service';
import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import httpStatus from 'http-status';
import { IAuthUser } from '../../../interfaces/common';

const fetchDashboardMetadata = catchAsync(async (req: Request, res: Response) => {
    console.log("🚀 ~ fetchDashboardMetadata ~ user:", 'user')
    
    const user = req.user;
    const result = await metaServices.fetchDashboardMetadata(user as IAuthUser);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Meta data retrieval successfully!",
        data: result,
    });
});

export const MetaController = {
    fetchDashboardMetadata
};
