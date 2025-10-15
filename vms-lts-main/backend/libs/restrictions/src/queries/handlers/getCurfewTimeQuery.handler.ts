import { QueryHandler, IQueryHandler } from "@nestjs/cqrs";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";

import { Restriction, RestrictionDocument } from "../../schema/restriction.schema";
import { GetCurfewTimeQuery } from "../impl/getCurfewTime.query";

@QueryHandler(GetCurfewTimeQuery)
export class GetCurfewTimeQueryHandler implements IQueryHandler {
    constructor(@InjectModel(Restriction.name) private restrictionModel: Model<RestrictionDocument>) {}

    async execute(query: GetCurfewTimeQuery) {
        const restriction = await this.restrictionModel.findOne({ name: "curfewTime" });
        if (!restriction) {
            // Return default restriction object if not found
            return { name: "curfewTime", value: 0 };
        }
        return restriction;
    }
}
