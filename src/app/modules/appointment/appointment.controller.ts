import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import httpStatus from 'http-status';
import { AppointmentServices } from './appointment.services';
import { IAuthUser } from '../../../interfaces/common';
import pick from '../../../shared/pick';
import { appointmentFilterableFields } from './appointment.constants';
interface QueryOptions {
    limit?: number;
    page?: number;
    sortBy?: string;
    sortOrder?: string;
  }
const createAppointment = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    const result = await AppointmentServices.createAppointment(req.body, user as IAuthUser);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Appointment booked successfully!',
        data: result,
    });
});

// const getMyAppointment = catchAsync(async (req: Request, res: Response) => {
//     const user = req.user;   
//     const filters = pick(req.query, appointmentFilterableFields);
//     const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
//     const result = await AppointmentServices.getMyAppointment(filters, options, user as IAuthUser);
//     sendResponse(res, {
//         statusCode: httpStatus.OK,
//         success: true,
//         message: 'Appointment retrieval successfully',
//         meta: result.meta,
//         data: result.data,
//     });
// });
const getMyAppointment = catchAsync(async (req: Request  , res: Response) => {
    const user = req.user as IAuthUser;
    const filters = pick(req.query, ['status', 'paymentStatus']);
    const options= pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']) as QueryOptions

    const result = await AppointmentServices.getMyAppointment(user , filters, options);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'My Appointment retrive successfully',
        data: result
    });
});


const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
    const filters = pick(req.query, appointmentFilterableFields)
    const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
    const result = await AppointmentServices.getAllFromDB(filters, options);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Appointment retrieval successfully',
        meta: result.meta,
        data: result.data,
    });
});

const changeAppointmentStatus = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = req.user;
    const result = await AppointmentServices.changeAppointmentStatus(id, req.body.status, user);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Appointment status changed successfully',
        data: result
    });
});

export const AppointmentController = {
    createAppointment,
    getMyAppointment,
    getAllFromDB,
    changeAppointmentStatus
};
