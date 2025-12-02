import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { StoreService } from '../../shared/store.service';
import { CreateProfileDto } from '../dto/create-profile.dto';
import {
  ProfileDetailDto,
  ProfileDetailItemDto,
} from '../dto/profile-detail.dto';
import { ProfileResponseDto } from '../dto/profile-response.dto';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { ProfilesService } from '../services/profiles.service';

@ApiTags('Pricing Profiles')
@Controller('pricing-profiles')
export class ProfilesController {
  constructor(
    private readonly profilesService: ProfilesService,
    private readonly store: StoreService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'List all pricing profiles',
    description: 'Get all pricing profiles for the current organization',
  })
  @ApiResponse({
    status: 200,
    description: 'List of pricing profiles',
    type: [ProfileResponseDto],
  })
  listProfiles(): ProfileResponseDto[] {
    const user = this.store.getCurrentUser();
    return this.profilesService.listProfiles(user.orgId);
  }

  @Post()
  @ApiOperation({
    summary: 'Create a new pricing profile',
    description:
      'Create a new pricing profile with name and selection type. ' +
      'Full configuration can be added later via update endpoint.',
  })
  @ApiBody({ type: CreateProfileDto })
  @ApiResponse({
    status: 201,
    description: 'Profile created successfully',
    type: ProfileResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 409,
    description: 'Profile with this name already exists',
  })
  createProfile(@Body() dto: CreateProfileDto): ProfileResponseDto {
    const user = this.store.getCurrentUser();
    return this.profilesService.createProfile(user.orgId, dto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get profile detail with calculated prices',
    description:
      'Get a pricing profile with calculated prices for all products. ' +
      'Shows the base price, adjustment value, and final price for each product.',
  })
  @ApiParam({
    name: 'id',
    description: 'Profile ID',
    example: 'profile-1',
  })
  @ApiResponse({
    status: 200,
    description: 'Profile detail with calculated prices',
    type: ProfileDetailDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Profile not found',
  })
  getProfileDetail(@Param('id') id: string): ProfileDetailDto {
    const user = this.store.getCurrentUser();
    return this.profilesService.getProfileDetail(id, user.orgId);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update a pricing profile',
    description:
      'Update pricing profile configuration. ' +
      'Selection type determines which fields are required:\n' +
      '- selectionType="all": requires adjustmentValueForAll\n' +
      '- selectionType="one": requires exactly 1 productAdjustment\n' +
      '- selectionType="multiple": requires 1+ productAdjustments',
  })
  @ApiParam({
    name: 'id',
    description: 'Profile ID',
    example: 'profile-1',
  })
  @ApiBody({ type: UpdateProfileDto })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
    type: ProfileResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data or business rule violation',
  })
  @ApiResponse({
    status: 404,
    description: 'Profile not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Profile with this name already exists',
  })
  updateProfile(
    @Param('id') id: string,
    @Body() dto: UpdateProfileDto,
  ): ProfileResponseDto {
    const user = this.store.getCurrentUser();
    return this.profilesService.updateProfile(id, user.orgId, dto);
  }

  @Post(':id/preview')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Preview profile pricing without saving',
    description:
      'Calculate and preview how prices would look with the provided changes, ' +
      'without actually updating the profile. Useful for testing pricing strategies.',
  })
  @ApiParam({
    name: 'id',
    description: 'Profile ID',
    example: 'profile-1',
  })
  @ApiBody({ type: UpdateProfileDto })
  @ApiResponse({
    status: 200,
    description: 'Preview of calculated prices',
    type: [ProfileDetailItemDto],
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data or business rule violation',
  })
  @ApiResponse({
    status: 404,
    description: 'Profile not found',
  })
  previewProfile(
    @Param('id') id: string,
    @Body() dto: UpdateProfileDto,
  ): ProfileDetailItemDto[] {
    const user = this.store.getCurrentUser();
    return this.profilesService.previewProfile(id, user.orgId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a pricing profile',
    description:
      "Delete a pricing profile with cascade logic. Any profiles based on this one will be updated to point to this profile's base.",
  })
  @ApiParam({
    name: 'id',
    description: 'Profile ID',
    example: 'profile-1',
  })
  @ApiResponse({
    status: 204,
    description: 'Profile deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Profile not found',
  })
  deleteProfile(@Param('id') id: string): void {
    const user = this.store.getCurrentUser();
    this.profilesService.deleteProfile(id, user.orgId);
  }
}
