const apiResponse = (statusCode: number, message: string, data: any) => {
  return {
    statusCode,
    message,
    data: statusCode <= 400 ? data : null,
    error: statusCode >= 400 ? data : null,
  };
};

export default apiResponse;
