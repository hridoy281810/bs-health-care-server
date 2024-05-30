// import { AppointmentStatus, UserRole } from "@prisma/client";
// import prisma from "../../../shared/prisma";
// import { IAuthUser } from "../../../interfaces/common";
// import ApiError from "../../../errors/ApiError";
// import httpStatus from "http-status";

// const fetchDashboardMetadata = async (user: any) => {
//     let metadata;
//     switch (user.role) {
//         case UserRole.ADMIN:
//             metadata = await getAdminDashboardMetadata();
//             break;
//         case UserRole.SUPER_ADMIN:
//             metadata = await getSuperAdminDashboardMetadata();
//             break;
//         case UserRole.DOCTOR:
//             metadata = await getDoctorDashboardMetadata(user);
//             break;
//         case UserRole.PATIENT:
//             metadata = await getPatientDashboardMetadata(user);
//             break;
//         default:
//             throw new Error('Invalid user role');
//     }

//     return metadata;
// }

// const getAdminDashboardMetadata = async () => {
//     const appointmentCount = await prisma.appointment.count();
//     const patientCount = await prisma.patient.count();
//     const doctorCount = await prisma.doctor.count();
//     const paymentCount = await prisma.payment.count();
//     const totalRevenue = await prisma.payment.aggregate({
//         _sum: { amount: true }
//     });

//     const barChartData = await getBarChartData();
//     const pieChartData = await getPieChartData();

//     return { appointmentCount, patientCount, doctorCount, paymentCount, totalRevenue, barChartData, pieChartData };
// }

// const getSuperAdminDashboardMetadata = async () => {
//     const appointmentCount = await prisma.appointment.count();
//     const patientCount = await prisma.patient.count();
//     const doctorCount = await prisma.doctor.count();
//     const adminCount = await prisma.admin.count();
//     const paymentCount = await prisma.payment.count();
//     const totalRevenue = await prisma.payment.aggregate({
//         _sum: { amount: true }
//     });

//     const barChartData = await getBarChartData();
//     const pieChartData = await getPieChartData();

//     return { appointmentCount, patientCount, doctorCount, adminCount, paymentCount, totalRevenue, barChartData, pieChartData };
// }

// const getDoctorDashboardMetadata = async (user: IAuthUser) => {
//     const doctor = await prisma.doctor.findUnique({
//         where: {
//             email: user?.email
//         }
//     });

//     if (!doctor) {
//         throw new Error('Doctor not found');
//     }

//     const appointmentCount = await prisma.appointment.count({
//         where: {
//             doctorId: doctor.id
//         }
//     });

//     const patientCount = await prisma.appointment.groupBy({
//         by: ['patientId'],
//         _count: {
//             id: true
//         }
//     });

//     const reviewCount = await prisma.review.count({
//         where: {
//             doctorId: doctor.id
//         }
//     });

//     const totalRevenue = await prisma.payment.aggregate({
//         _sum: {
//             amount: true
//         },
//         where: {
//             appointment: {
//                 doctorId: doctor.id
//             }
//         }
//     });

//     const appointmentStatusDistribution = await prisma.appointment.groupBy({
//         by: ['status'],
//         _count: { id: true },
//         where: {
//             doctorId: doctor.id
//         }
//     });

//     const formattedAppointmentStatusDistribution = appointmentStatusDistribution.map(({ status, _count }) => ({
//         status,
//         count: Number(_count.id)
//     }));

//     return {
//         appointmentCount,
//         patientCount: patientCount.length,
//         reviewCount,
//         totalRevenue,
//         appointmentStatusDistribution: formattedAppointmentStatusDistribution
//     };
// }


// const getPatientDashboardMetadata = async (user: IAuthUser) => {
//     const patient = await prisma.patient.findUnique({
//         where: {
//             email: user?.email
//         }
//     });

//     if (!patient) {
//         throw new ApiError(httpStatus.BAD_REQUEST, "Patient not found!")
//     }

//     const appointmentCount = await prisma.appointment.count({
//         where: {
//             patientId: patient.id
//         }
//     });

//     const prescriptionCount = await prisma.prescription.count({
//         where: {
//             patientId: patient.id
//         }
//     });

//     const reviewCount = await prisma.review.count({
//         where: {
//             patientId: patient.id
//         }
//     });

//     const appointmentStatusDistribution = await prisma.appointment.groupBy({
//         by: ['status'],
//         _count: { id: true },
//         where: {
//             patientId: patient.id
//         }
//     });

//     const formattedAppointmentStatusDistribution = appointmentStatusDistribution.map(({ status, _count }) => ({
//         status,
//         count: Number(_count.id)
//     }));

//     return {
//         appointmentCount,
//         reviewCount,
//         prescriptionCount,
//         appointmentStatusDistribution: formattedAppointmentStatusDistribution
//     };
// }

// const getBarChartData = async () => {
//     const appointmentCountByMonth: { month: Date, count: bigint }[] = await prisma.$queryRaw`
//         SELECT DATE_TRUNC('month', "createdAt") AS month,
//                COUNT(*) AS count
//         FROM "appointments"
//         GROUP BY month
//         ORDER BY month ASC
//     `;

//     const formattedMetadata = appointmentCountByMonth.map(({ month, count }) => ({
//         month,
//         count: Number(count), // Convert BigInt to integer
//     }));
//     return formattedMetadata;
// }


// const getPieChartData = async () => {
//     const appointmentStatusDistribution = await prisma.appointment.groupBy({
//         by: ['status'],
//         _count: { id: true },
//     });

//     const formattedData = appointmentStatusDistribution.map(({ status, _count }) => ({
//         status,
//         count: Number(_count.id), // Convert BigInt to integer
//     }));

//     return formattedData;
// }

// export const metaServices = {
//     fetchDashboardMetadata
// }

import { PaymentStatus, UserRole } from "@prisma/client";
import prisma from "../../../shared/prisma";
import { IAuthUser } from "../../../interfaces/common";

const fetchDashboardMetadata = async (user: IAuthUser) => {
    let metaData;
    switch (user?.role) {
        case UserRole.SUPER_ADMIN:
            metaData = getSuperAdminMetaData();
            break;
        case UserRole.ADMIN:
            metaData = getAdminMetaData();
            break;
        case UserRole.DOCTOR:
            metaData = getDoctorMetaData(user as IAuthUser);
            break;
        case UserRole.PATIENT:
            metaData = getPatientMetaData(user)
            break;
        default:
            throw new Error('Invalid user role!')
    }

    return metaData;
};

const getSuperAdminMetaData = async () => {
    const appointmentCount = await prisma.appointment.count();
    const patientCount = await prisma.patient.count();
    const doctorCount = await prisma.doctor.count();
    const adminCount = await prisma.admin.count();
    const paymentCount = await prisma.payment.count();

    const totalRevenue = await prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
            status: PaymentStatus.PAID
        }
    });

    const barChartData = await getBarChartData();
    const pieCharData = await getPieChartData();

    return { appointmentCount, patientCount, doctorCount, adminCount, paymentCount, totalRevenue, barChartData, pieCharData }
}

const getAdminMetaData = async () => {
    const appointmentCount = await prisma.appointment.count();
    const patientCount = await prisma.patient.count();
    const doctorCount = await prisma.doctor.count();
    const paymentCount = await prisma.payment.count();

    const totalRevenue = await prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
            status: PaymentStatus.PAID
        }
    });

    const barChartData = await getBarChartData();
    const pieCharData = await getPieChartData();

    return { appointmentCount, patientCount, doctorCount, paymentCount, totalRevenue, barChartData, pieCharData }
}

const getDoctorMetaData = async (user: IAuthUser) => {
    const doctorData = await prisma.doctor.findUniqueOrThrow({
        where: {
            email: user?.email
        }
    });

    const appointmentCount = await prisma.appointment.count({
        where: {
            doctorId: doctorData.id
        }
    });

    const patientCount = await prisma.appointment.groupBy({
        by: ['patientId'],
        _count: {
            id: true
        }
    });

    const reviewCount = await prisma.review.count({
        where: {
            doctorId: doctorData.id
        }
    });

    const totalRevenue = await prisma.payment.aggregate({
        _sum: {
            amount: true
        },
        where: {
            appointment: {
                doctorId: doctorData.id
            },
            status: PaymentStatus.PAID
        }
    });

    const appointmentStatusDistribution = await prisma.appointment.groupBy({
        by: ['status'],
        _count: { id: true },
        where: {
            doctorId: doctorData.id
        }
    });

    const formattedAppointmentStatusDistribution = appointmentStatusDistribution.map(({ status, _count }) => ({
        status,
        count: Number(_count.id)
    }))

    return {
        appointmentCount,
        reviewCount,
        patientCount: patientCount.length,
        totalRevenue,
        formattedAppointmentStatusDistribution
    }
}

const getPatientMetaData = async (user: IAuthUser) => {
    const patientData = await prisma.patient.findUniqueOrThrow({
        where: {
            email: user?.email
        }
    });

    const appointmentCount = await prisma.appointment.count({
        where: {
            patientId: patientData.id
        }
    });

    const prescriptionCount = await prisma.prescription.count({
        where: {
            patientId: patientData.id
        }
    });

    const reviewCount = await prisma.review.count({
        where: {
            patientId: patientData.id
        }
    });

    const appointmentStatusDistribution = await prisma.appointment.groupBy({
        by: ['status'],
        _count: { id: true },
        where: {
            patientId: patientData.id
        }
    });

    const formattedAppointmentStatusDistribution = appointmentStatusDistribution.map(({ status, _count }) => ({
        status,
        count: Number(_count.id)
    }))

    return {
        appointmentCount,
        prescriptionCount,
        reviewCount,
        formattedAppointmentStatusDistribution
    }
}

const getBarChartData = async () => {
    const appointmentCountByMonth: { month: Date, count: bigint }[] = await prisma.$queryRaw`
        SELECT DATE_TRUNC('month', "createdAt") AS month,
        CAST(COUNT(*) AS INTEGER) AS count
        FROM "appointments"
        GROUP BY month
        ORDER BY month ASC
    `

    return appointmentCountByMonth;
};

const getPieChartData = async () => {
    const appointmentStatusDistribution = await prisma.appointment.groupBy({
        by: ['status'],
        _count: { id: true }
    });

    const formattedAppointmentStatusDistribution = appointmentStatusDistribution.map(({ status, _count }) => ({
        status,
        count: Number(_count.id)
    }));

    return formattedAppointmentStatusDistribution;
}

export const metaServices = {
    fetchDashboardMetadata
}
