import { QueryHandler, IQueryHandler } from "@nestjs/cqrs";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";

import { Reward, RewardsDocument } from "../../schema/reward.schema";
import { GetMaxRequirementQuery } from "../impl/getMaxRequirement.query";

@QueryHandler(GetMaxRequirementQuery)
export class GetMaxRequirementQueryHandler implements IQueryHandler {
    constructor(@InjectModel(Reward.name) private rewardModel: Model<RewardsDocument>) {}

    async execute(query: GetMaxRequirementQuery) {
        const biggest = await this.rewardModel.find().sort("-xp").limit(1);
        if (!biggest || biggest.length === 0) {
            return 0; // Default value when no rewards exist
        }
        return biggest[0].xp || 0;
    }
}
