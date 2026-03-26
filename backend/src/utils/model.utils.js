const getNextId = async (Model) => {
    const latest = await Model.findOne({}, { id: 1 }).sort({ id: -1 }).lean();
    return latest ? latest.id + 1 : 1;
};

module.exports = {
    getNextId,
};
