<template>
  <div>
    <!-- 贷款信息部分 -->
    <el-divider content-position="left">贷款信息</el-divider>
    
    <el-form v-loading="loading" :model="rateForm" ref="rateFormRef" label-width="120px" class="rate-form" :rules="rules">
      <!-- 贷款金额信息 - 始终显示原欠款金额 -->
      <el-form-item label="原欠款金额(万元)" prop="originalDebt">
        <el-input v-model="rateForm.originalDebt" placeholder="" style="width: 90%" disabled/>
      </el-form-item>
      
      <!-- 基础贷款字段始终显示 -->
      <el-form-item label="信用(万元)" prop="credit" :required="true">
        <el-input v-model="rateForm.credit" 
        placeholder="请输入信用" 
        style="width: 90%" 
        @input="validateNumberInput('credit', '信用')" 
        @keypress="onlyAllowPositiveNumber($event)"
        clearable 
        type="number"
        min="0"
        @mousewheel.native.prevent
        />
      </el-form-item>
      
      <el-form-item label="保证(万元)" prop="guarantee" :required="true">
        <el-input v-model="rateForm.guarantee" 
        placeholder="请输入保证" 
        style="width: 90%" 
        @input="validateNumberInput('guarantee', '保证')" 
        @keypress="onlyAllowPositiveNumber($event)"
        clearable 
        type="number"
        min="0"
        @mousewheel.native.prevent
        />
      </el-form-item>
      
      <el-form-item label="抵质押(万元)" prop="collateral" :required="true">
        <el-input v-model="rateForm.collateral" 
        placeholder="请输入抵质押" 
        style="width: 90%" 
        @input="validateNumberInput('collateral', '抵质押')" 
        @keypress="onlyAllowPositiveNumber($event)"
        clearable 
        type="number"
        min="0"
        @mousewheel.native.prevent
        />
      </el-form-item>
      
      <el-form-item label="申请金额(万元)" prop="applyAmount" :required="true">
        <el-input 
          v-model="rateForm.applyAmount" 
          placeholder="请输入申请金额" 
          style="width: 90%" 
          @input="validateNumberInput('applyAmount', '申请金额')"
          @keypress="onlyAllowPositiveNumber($event)"
          clearable
          type="number"
          min="0"
          @mousewheel.native.prevent
        />
      </el-form-item>
      
      
      
      <!-- 额度定价 -->
      <el-form-item v-if="shouldShowField('quota')" label="额度定价" prop="quota" :required="rateForm.guaranteeType === '抵押'">
        <div class="input-bp-container">
          <el-select v-model="rateForm.quota" :placeholder="rateForm.guaranteeType === '抵押' ? '请选择额度定价' : '非抵押方式，额度定价为空'" disabled>
            <el-option 
              v-for="option in quotaOptions" 
              :key="option.value" 
              :label="option.label" 
              :value="option.value" 
            />
          </el-select>
          <div class="bp-badge-container" v-if="rateForm.quota">
            <span 
              class="bp-badge" 
              :class="{
                'bp-badge-limited': rateForm.quotaBpLimited,
                'bp-badge-negative': !rateForm.quotaBpLimited && parseFloat(rateForm.quotaBp) > 0,
                'bp-badge-positive': !rateForm.quotaBpLimited && parseFloat(rateForm.quotaBp) < 0,
                'bp-badge-zero': !rateForm.quotaBpLimited && parseFloat(rateForm.quotaBp) === 0
              }"
            >
              BP: {{rateForm.quotaBp}}
              <i v-if="rateForm.quotaBpLimited" class="el-icon-warning-outline" style="margin-left: 2px;"></i>
            </span>
          </div>
        </div>
      </el-form-item>
      
      <!-- 担保方式 -->
      <el-form-item v-if="shouldShowField('guaranteeType')" label="担保方式" prop="guaranteeType" :required="true">
        <div class="input-bp-container">
          <el-select v-model="rateForm.guaranteeType" placeholder="请选择担保方式" clearable
            @change="(value) => handleSelectChange('guaranteeType', value, guaranteeTypeOptions, '担保方式')">
            <el-option
              v-for="option in guaranteeTypeOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
          <div class="bp-badge-container" v-if="rateForm.guaranteeType && rateForm.guaranteeType !== ''">
            <span 
              class="bp-badge" 
              :class="{
                'bp-badge-limited': rateForm.guaranteeTypeBpLimited,
                'bp-badge-negative': !rateForm.guaranteeTypeBpLimited && parseFloat(rateForm.guaranteeTypeBp) > 0,
                'bp-badge-positive': !rateForm.guaranteeTypeBpLimited && parseFloat(rateForm.guaranteeTypeBp) < 0,
                'bp-badge-zero': !rateForm.guaranteeTypeBpLimited && parseFloat(rateForm.guaranteeTypeBp) === 0
              }"
            >
              BP: {{rateForm.guaranteeTypeBp}}
              <i v-if="rateForm.guaranteeTypeBpLimited" class="el-icon-warning-outline" style="margin-left: 2px;"></i>
            </span>
          </div>
        </div>
      </el-form-item>
      

      <!-- 贷款基础信息 -->
      <el-form-item v-if="shouldShowField('loanTerm')" label="贷款期限" prop="loanTerm" :required="true">
        <div class="input-bp-container">
          <el-select 
            v-model="rateForm.loanTerm" 
            placeholder="请选择贷款期限" 
            clearable
            @change="(value) => handleSelectChange('loanTerm', value, loanTermOptions, '贷款期限')"
            :disabled="!rateForm.guaranteeType">
            <el-option
              v-for="option in loanTermOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
          <div class="bp-badge-container" v-if="rateForm.loanTerm && rateForm.loanTerm !== ''">
            <span 
              class="bp-badge" 
              :class="{
                'bp-badge-limited': rateForm.loanTermBpLimited,
                'bp-badge-negative': !rateForm.loanTermBpLimited && parseFloat(rateForm.loanTermBp) > 0,
                'bp-badge-positive': !rateForm.loanTermBpLimited && parseFloat(rateForm.loanTermBp) < 0,
                'bp-badge-zero': !rateForm.loanTermBpLimited && parseFloat(rateForm.loanTermBp) === 0
              }"
            >
              BP: {{rateForm.loanTermBp}}
              <i v-if="rateForm.loanTermBpLimited" class="el-icon-warning-outline" style="margin-left: 2px;"></i>
            </span>
          </div>
        </div>
      </el-form-item>
      
      <!-- 借款人类型 -->
      <el-form-item v-if="shouldShowField('borrowerType')" label="借款人类型" prop="borrowerType" :required="true">
        <div class="input-bp-container">
          <el-select v-model="rateForm.borrowerType" placeholder="请选择借款人类型" clearable
            @change="(value) => handleSelectChange('borrowerType', value, borrowerTypeOptions, '借款人类型')">
            <el-option
              v-for="option in borrowerTypeOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
          <div class="bp-badge-container" v-if="rateForm.borrowerType && rateForm.borrowerType !== ''">
            <span 
              class="bp-badge" 
              :class="{
                'bp-badge-limited': rateForm.borrowerTypeBpLimited,
                'bp-badge-negative': !rateForm.borrowerTypeBpLimited && parseFloat(rateForm.borrowerTypeBp) > 0,
                'bp-badge-positive': !rateForm.borrowerTypeBpLimited && parseFloat(rateForm.borrowerTypeBp) < 0,
                'bp-badge-zero': !rateForm.borrowerTypeBpLimited && parseFloat(rateForm.borrowerTypeBp) === 0
              }"
            >
              BP: {{rateForm.borrowerTypeBp}}
              <i v-if="rateForm.borrowerTypeBpLimited" class="el-icon-warning-outline" style="margin-left: 2px;"></i>
            </span>
          </div>
        </div>
      </el-form-item>
      
      <!-- 用款方式 -->
      <el-form-item v-if="shouldShowField('fundingMethod')" label="用款方式" prop="fundingMethod" :required="true">
        <div class="input-bp-container">
          <el-select v-model="rateForm.fundingMethod" placeholder="请选择用款方式" clearable
            @change="(value) => handleSelectChange('fundingMethod', value, fundingMethodOptions, '用款方式')">
            <el-option
              v-for="option in fundingMethodOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
          <div class="bp-badge-container" v-if="rateForm.fundingMethod && rateForm.fundingMethod !== ''">
            <span 
              class="bp-badge" 
              :class="{
                'bp-badge-limited': rateForm.fundingMethodBpLimited,
                'bp-badge-negative': !rateForm.fundingMethodBpLimited && parseFloat(rateForm.fundingMethodBp) > 0,
                'bp-badge-positive': !rateForm.fundingMethodBpLimited && parseFloat(rateForm.fundingMethodBp) < 0,
                'bp-badge-zero': !rateForm.fundingMethodBpLimited && parseFloat(rateForm.fundingMethodBp) === 0
              }"
            >
              BP: {{rateForm.fundingMethodBp}}
              <i v-if="rateForm.fundingMethodBpLimited" class="el-icon-warning-outline" style="margin-left: 2px;"></i>
            </span>
          </div>
        </div>
      </el-form-item>
      
      <!-- 融资家数 -->
      <el-form-item v-if="shouldShowField('creditNum')" label="融资家数" prop="creditNum" :required="true">
        <div class="input-bp-container">
          <el-select v-model="rateForm.creditNum" placeholder="请选择融资家数" clearable
            @change="(value) => handleSelectChange('creditNum', value, creditNumOptions, '融资家数')">
            <el-option
              v-for="option in creditNumOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
          <div class="bp-badge-container" v-if="rateForm.creditNum && rateForm.creditNum !== ''">
            <span 
              class="bp-badge" 
              :class="{
                'bp-badge-limited': rateForm.creditNumBpLimited,
                'bp-badge-negative': !rateForm.creditNumBpLimited && parseFloat(rateForm.creditNumBp) > 0,
                'bp-badge-positive': !rateForm.creditNumBpLimited && parseFloat(rateForm.creditNumBp) < 0,
                'bp-badge-zero': !rateForm.creditNumBpLimited && parseFloat(rateForm.creditNumBp) === 0
              }"
            >
              BP: {{rateForm.creditNumBp}}
              <i v-if="rateForm.creditNumBpLimited" class="el-icon-warning-outline" style="margin-left: 2px;"></i>
            </span>
          </div>
        </div>
      </el-form-item>
      
      <!-- 粘性指标 -->
      <el-form-item v-if="shouldShowField('intermediateServices')" label="粘性指标" prop="intermediateServices">
        <div class="input-bp-container">
          <el-select v-model="rateForm.intermediateServices" multiple placeholder="请选择粘性指标" clearable disabled
            @change="(newValues) => $emit('multi-select-change', 'intermediateServices', newValues)" collapse-tags collapse-tags-tooltip>
            <el-option 
              v-for="option in intermediateServicesOptions" 
              :key="option.value" 
              :label="option.label" 
              :value="option.value"
            />
          </el-select>
          <div class="bp-badge-container" v-if="rateForm.intermediateServices && rateForm.intermediateServices.length > 0">
            <el-tooltip 
              placement="top"
              :content="getSelectedLabels(intermediateServicesOptions, rateForm.intermediateServices) +
                        (rateForm.intermediateServicesBpLimited ? ' (已达到BP限制)' : '')"
              popper-class="bp-tooltip"
            >
              <span 
                class="bp-badge" 
                :class="{
                  'bp-badge-limited': rateForm.intermediateServicesBpLimited,
                  'bp-badge-negative': !rateForm.intermediateServicesBpLimited && parseFloat(rateForm.intermediateServicesBp) > 0,
                  'bp-badge-positive': !rateForm.intermediateServicesBpLimited && parseFloat(rateForm.intermediateServicesBp) < 0,
                  'bp-badge-zero': !rateForm.intermediateServicesBpLimited && parseFloat(rateForm.intermediateServicesBp) === 0
                }"
              >
                BP: {{rateForm.intermediateServicesBp}}
                <i v-if="rateForm.intermediateServicesBpLimited" class="el-icon-warning-outline" style="margin-left: 2px;"></i>
              </span>
            </el-tooltip>
          </div>
        </div>
      </el-form-item>
      
      <!-- 仅在担保方式为抵押时显示的字段 -->
      <template v-if="rateForm.guaranteeType === '抵押'">
        <!-- 土地性质 -->
        <el-form-item v-if="shouldShowField('landType')" label="土地性质" prop="landType" :required="true">
          <div class="input-bp-container">
            <el-select v-model="rateForm.landType" placeholder="请选择土地性质" clearable
              @change="(value) => handleSelectChange('landType', value, landTypeOptions, '土地性质')">
              <el-option
                v-for="option in landTypeOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
            <div class="bp-badge-container" v-if="rateForm.landType && rateForm.landType !== ''">
              <span 
                class="bp-badge" 
                :class="{
                  'bp-badge-limited': rateForm.landTypeBpLimited,
                  'bp-badge-negative': !rateForm.landTypeBpLimited && parseFloat(rateForm.landTypeBp) > 0,
                  'bp-badge-positive': !rateForm.landTypeBpLimited && parseFloat(rateForm.landTypeBp) < 0,
                  'bp-badge-zero': !rateForm.landTypeBpLimited && parseFloat(rateForm.landTypeBp) === 0
                }"
              >
                BP: {{rateForm.landTypeBp}}
                <i v-if="rateForm.landTypeBpLimited" class="el-icon-warning-outline" style="margin-left: 2px;"></i>
              </span>
            </div>
          </div>
        </el-form-item>
        
        <!-- 抵押物属性 -->
        <el-form-item v-if="shouldShowField('purpose')" label="抵押物属性" prop="purpose" :required="true">
          <div class="input-bp-container">
            <el-select v-model="rateForm.purpose" placeholder="请选择抵押物属性" clearable
              @change="(value) => handleSelectChange('purpose', value, purposeOptions, '抵押物属性')">
              <el-option
                v-for="option in purposeOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
            <div class="bp-badge-container" v-if="rateForm.purpose && rateForm.purpose !== ''">
              <span 
                class="bp-badge" 
                :class="{
                  'bp-badge-limited': rateForm.purposeBpLimited,
                  'bp-badge-negative': !rateForm.purposeBpLimited && parseFloat(rateForm.purposeBp) > 0,
                  'bp-badge-positive': !rateForm.purposeBpLimited && parseFloat(rateForm.purposeBp) < 0,
                  'bp-badge-zero': !rateForm.purposeBpLimited && parseFloat(rateForm.purposeBp) === 0
                }"
              >
                BP: {{rateForm.purposeBp}}
                <i v-if="rateForm.purposeBpLimited" class="el-icon-warning-outline" style="margin-left: 2px;"></i>
              </span>
            </div>
          </div>
        </el-form-item>
        
        <!-- 抵押物属地 -->
        <el-form-item v-if="shouldShowField('region')" label="抵押物属地" prop="region" :required="true">
          <div class="input-bp-container">
            <el-select v-model="rateForm.region" placeholder="请选择抵押物属地" clearable
              @change="(value) => handleSelectChange('region', value, regionOptions, '抵押物属地')">
              <el-option
                v-for="option in regionOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
            <div class="bp-badge-container" v-if="rateForm.region && rateForm.region !== ''">
              <span 
                class="bp-badge" 
                :class="{
                  'bp-badge-limited': rateForm.regionBpLimited,
                  'bp-badge-negative': !rateForm.regionBpLimited && parseFloat(rateForm.regionBp) > 0,
                  'bp-badge-positive': !rateForm.regionBpLimited && parseFloat(rateForm.regionBp) < 0,
                  'bp-badge-zero': !rateForm.regionBpLimited && parseFloat(rateForm.regionBp) === 0
                }"
              >
                BP: {{rateForm.regionBp}}
                <i v-if="rateForm.regionBpLimited" class="el-icon-warning-outline" style="margin-left: 2px;"></i>
              </span>
            </div>
          </div>
        </el-form-item>
      </template>
      
      <!-- 客户特殊字段 -->
      <!-- 征信因素 -->
      <el-form-item v-if="shouldShowField('creditFactors')" label="征信因素" prop="creditFactors" :required="true">
        <div class="input-bp-container">
          <el-select v-model="rateForm.creditFactors" placeholder="请选择征信因素" clearable
            @change="(value) => handleSelectChange('creditFactors', value, creditFactorsOptions, '征信因素')">
            <el-option
              v-for="option in creditFactorsOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
          <div class="bp-badge-container" v-if="rateForm.creditFactors && rateForm.creditFactors !== ''">
            <span 
              class="bp-badge" 
              :class="{
                'bp-badge-limited': rateForm.creditFactorsBpLimited,
                'bp-badge-negative': !rateForm.creditFactorsBpLimited && parseFloat(rateForm.creditFactorsBp) > 0,
                'bp-badge-positive': !rateForm.creditFactorsBpLimited && parseFloat(rateForm.creditFactorsBp) < 0,
                'bp-badge-zero': !rateForm.creditFactorsBpLimited && parseFloat(rateForm.creditFactorsBp) === 0
              }"
            >
              BP: {{rateForm.creditFactorsBp}}
              <i v-if="rateForm.creditFactorsBpLimited" class="el-icon-warning-outline" style="margin-left: 2px;"></i>
            </span>
          </div>
        </div>
      </el-form-item>
      
      <!-- 还款方式 -->
      <el-form-item v-if="shouldShowField('repaymentMethod')" label="还款方式" prop="repaymentMethod" :required="true">
        <div class="input-bp-container">
          <el-select v-model="rateForm.repaymentMethod" placeholder="请选择还款方式" clearable
            @change="(value) => handleSelectChange('repaymentMethod', value, repaymentMethodOptions, '还款方式')">
            <el-option
              v-for="option in repaymentMethodOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
          <div class="bp-badge-container" v-if="rateForm.repaymentMethod && rateForm.repaymentMethod !== ''">
            <span 
              class="bp-badge" 
              :class="{
                'bp-badge-limited': rateForm.repaymentMethodBpLimited,
                'bp-badge-negative': !rateForm.repaymentMethodBpLimited && parseFloat(rateForm.repaymentMethodBp) > 0,
                'bp-badge-positive': !rateForm.repaymentMethodBpLimited && parseFloat(rateForm.repaymentMethodBp) < 0,
                'bp-badge-zero': !rateForm.repaymentMethodBpLimited && parseFloat(rateForm.repaymentMethodBp) === 0
              }"
            >
              BP: {{rateForm.repaymentMethodBp}}
              <i v-if="rateForm.repaymentMethodBpLimited" class="el-icon-warning-outline" style="margin-left: 2px;"></i>
            </span>
          </div>
        </div>
      </el-form-item>
      
      <!-- 还息因素 -->
      <el-form-item v-if="shouldShowField('interestFactors')" label="还息因素" prop="interestFactors" :required="true">
        <div class="input-bp-container">
          <el-select v-model="rateForm.interestFactors" placeholder="请选择还息因素" clearable disabled
            @change="(value) => handleSelectChange('interestFactors', value, interestFactorsOptions, '还息因素')">
            <el-option
              v-for="option in interestFactorsOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
          <div class="bp-badge-container" v-if="rateForm.interestFactors && rateForm.interestFactors !== ''">
            <el-tooltip 
              placement="top"
              :content="getSelectedLabels(interestFactorsOptions, [rateForm.interestFactors])"
              popper-class="bp-tooltip"
            >
            <span 
              class="bp-badge" 
              :class="{
                'bp-badge-limited': rateForm.interestFactorsBpLimited,
                'bp-badge-negative': !rateForm.interestFactorsBpLimited && parseFloat(rateForm.interestFactorsBp) > 0,
                'bp-badge-positive': !rateForm.interestFactorsBpLimited && parseFloat(rateForm.interestFactorsBp) < 0,
                'bp-badge-zero': !rateForm.interestFactorsBpLimited && parseFloat(rateForm.interestFactorsBp) === 0
              }"
            >
              BP: {{rateForm.interestFactorsBp}}
              <i v-if="rateForm.interestFactorsBpLimited" class="el-icon-warning-outline" style="margin-left: 2px;"></i>
            </span>
            </el-tooltip>
          </div>
        </div>
      </el-form-item>
      
      <!-- 首贷因素 -->
      <el-form-item v-if="shouldShowField('firstLoanFactors')" label="首贷因素" prop="firstLoanFactors" :required="true">
        <div class="input-bp-container">
          <el-select v-model="rateForm.firstLoanFactors" placeholder="请选择首贷因素" clearable disabled
            @change="(value) => handleSelectChange('firstLoanFactors', value, firstLoanFactorsOptions, '首贷因素')">
            <el-option
              v-for="option in firstLoanFactorsOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
          <div class="bp-badge-container" v-if="rateForm.firstLoanFactors && rateForm.firstLoanFactors !== ''">
            <el-tooltip 
              placement="top"
              :content="getSelectedLabels(firstLoanFactorsOptions, [rateForm.firstLoanFactors])"
              popper-class="bp-tooltip"
            >
            <span 
              class="bp-badge" 
              :class="{
                'bp-badge-limited': rateForm.firstLoanFactorsBpLimited,
                'bp-badge-negative': !rateForm.firstLoanFactorsBpLimited && parseFloat(rateForm.firstLoanFactorsBp) > 0,
                'bp-badge-positive': !rateForm.firstLoanFactorsBpLimited && parseFloat(rateForm.firstLoanFactorsBp) < 0,
                'bp-badge-zero': !rateForm.firstLoanFactorsBpLimited && parseFloat(rateForm.firstLoanFactorsBp) === 0
              }"
            >
              BP: {{rateForm.firstLoanFactorsBp}}
              <i v-if="rateForm.firstLoanFactorsBpLimited" class="el-icon-warning-outline" style="margin-left: 2px;"></i>
            </span>
            </el-tooltip>
          </div>
        </div>
      </el-form-item>
      
      <!-- 仅在客户类型为个人时显示的字段 -->
      <template v-if="submitData.customerType === '对私'">
        <el-form-item v-if="shouldShowField('age')" label="年龄" prop="age" :required="true">
          <div class="input-bp-container">
            <el-select v-model="rateForm.age" placeholder="请选择年龄" clearable
              @change="(value) => handleSelectChange('age', value, ageOptions, '年龄')">
              <el-option
                v-for="option in ageOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
            <div class="bp-badge-container">
              <span v-if="idCardAge" class="age-info"> {{ idCardAge }}岁</span>
              <span 
                class="bp-badge" 
                :class="{
                  'bp-badge-limited': rateForm.ageBpLimited,
                  'bp-badge-negative': !rateForm.ageBpLimited && parseFloat(rateForm.ageBp) > 0,
                  'bp-badge-positive': !rateForm.ageBpLimited && parseFloat(rateForm.ageBp) < 0,
                  'bp-badge-zero': !rateForm.ageBpLimited && parseFloat(rateForm.ageBp) === 0
                }"
              >
                BP: {{rateForm.ageBp}}
                <i v-if="rateForm.ageBpLimited" class="el-icon-warning-outline" style="margin-left: 2px;"></i>
              </span>
            </div>
          </div>
        </el-form-item>
      </template>
      
      <!-- 行业属性 -->
      <el-form-item v-if="shouldShowField('industryProperty')" label="行业属性" prop="industryProperty" :required="true">
        <div class="input-bp-container">
          <el-select v-model="rateForm.industryProperty" multiple placeholder="请选择行业属性" clearable
            @change="(newValues) => $emit('multi-select-change', 'industryProperty', newValues)" collapse-tags collapse-tags-tooltip>
            <el-option 
              v-for="option in industryPropertyOptions" 
              :key="option.value" 
              :label="option.label" 
              :value="option.value" 
            />
          </el-select>
          <div class="bp-badge-container" v-if="rateForm.industryProperty && rateForm.industryProperty.length > 0">
            <el-tooltip 
              placement="top"
              :content="getSelectedLabels(industryPropertyOptions, rateForm.industryProperty) +
                        (rateForm.industryPropertyBpLimited ? ' (已达到BP限制)' : '')"
              popper-class="bp-tooltip"
            >
              <span 
                class="bp-badge" 
                :class="{
                  'bp-badge-limited': rateForm.industryPropertyBpLimited,
                  'bp-badge-negative': !rateForm.industryPropertyBpLimited && parseFloat(rateForm.industryPropertyBp) > 0,
                  'bp-badge-positive': !rateForm.industryPropertyBpLimited && parseFloat(rateForm.industryPropertyBp) < 0,
                  'bp-badge-zero': !rateForm.industryPropertyBpLimited && parseFloat(rateForm.industryPropertyBp) === 0
                }"
              >
                BP: {{rateForm.industryPropertyBp}}
                <i v-if="rateForm.industryPropertyBpLimited" class="el-icon-warning-outline" style="margin-left: 2px;"></i>
              </span>
            </el-tooltip>
          </div>
        </div>
      </el-form-item>
      
      <!-- 忠诚度 -->
      <el-form-item v-if="shouldShowField('loyaltyDegree')" label="忠诚度" prop="loyaltyDegree">
        <div class="input-bp-container">
          <el-select v-model="rateForm.loyaltyDegree" multiple placeholder="" clearable disabled
            @change="(newValues) => $emit('multi-select-change', 'loyaltyDegree', newValues)" collapse-tags collapse-tags-tooltip>
            <el-option 
              v-for="option in loyaltyDegreeOptions" 
              :key="option.value" 
              :label="option.label" 
              :value="option.value" 
            />
          </el-select>
          <div class="bp-badge-container" v-if="rateForm.loyaltyDegree && rateForm.loyaltyDegree.length > 0">
            <el-tooltip 
              placement="top"
              :content="getSelectedLabels(loyaltyDegreeOptions, rateForm.loyaltyDegree) +
                        (rateForm.loyaltyDegreeBpLimited ? ' (已达到BP限制)' : '')"
              popper-class="bp-tooltip"
            >
              <span 
                class="bp-badge" 
                :class="{
                  'bp-badge-limited': rateForm.loyaltyDegreeBpLimited,
                  'bp-badge-negative': !rateForm.loyaltyDegreeBpLimited && parseFloat(rateForm.loyaltyDegreeBp) > 0,
                  'bp-badge-positive': !rateForm.loyaltyDegreeBpLimited && parseFloat(rateForm.loyaltyDegreeBp) < 0,
                  'bp-badge-zero': !rateForm.loyaltyDegreeBpLimited && parseFloat(rateForm.loyaltyDegreeBp) === 0
                }"
              >
                BP: {{rateForm.loyaltyDegreeBp}}
                <i v-if="rateForm.loyaltyDegreeBpLimited" class="el-icon-warning-outline" style="margin-left: 2px;"></i>
              </span>
            </el-tooltip>
          </div>
        </div>
      </el-form-item>
      
      <!-- 财富业务 -->
      <el-form-item v-if="shouldShowField('wealthBusiness')" label="财富业务" prop="wealthBusiness">
        <div class="input-bp-container">
          <el-select v-model="rateForm.wealthBusiness" multiple placeholder="请选择财富业务" clearable 
            @change="(newValues) => $emit('multi-select-change', 'wealthBusiness', newValues)" collapse-tags collapse-tags-tooltip>
            <el-option 
              v-for="option in wealthBusinessOptions" 
              :key="option.value" 
              :label="option.label" 
              :value="option.value" 
            />
          </el-select>
          <div class="bp-badge-container" v-if="rateForm.wealthBusiness && rateForm.wealthBusiness.length > 0">
            <el-tooltip 
              placement="top"
              :content="getSelectedLabels(wealthBusinessOptions, rateForm.wealthBusiness) +
                        (rateForm.wealthBusinessBpLimited ? ' (已达到BP限制)' : '')"
              popper-class="bp-tooltip"
            >
              <span 
                class="bp-badge" 
                :class="{
                  'bp-badge-limited': rateForm.wealthBusinessBpLimited,
                  'bp-badge-negative': !rateForm.wealthBusinessBpLimited && parseFloat(rateForm.wealthBusinessBp) > 0,
                  'bp-badge-positive': !rateForm.wealthBusinessBpLimited && parseFloat(rateForm.wealthBusinessBp) < 0,
                  'bp-badge-zero': !rateForm.wealthBusinessBpLimited && parseFloat(rateForm.wealthBusinessBp) === 0
                }"
              >
                BP: {{rateForm.wealthBusinessBp}}
                <i v-if="rateForm.wealthBusinessBpLimited" class="el-icon-warning-outline" style="margin-left: 2px;"></i>
              </span>
            </el-tooltip>
          </div>
        </div>
      </el-form-item>
      
      <!-- 特殊业务/荣誉 -->
      <el-form-item v-if="shouldShowField('specialBusiness')" label="特殊荣誉" prop="specialBusiness" :required="true">
        <div class="input-bp-container">
          <el-select v-model="rateForm.specialBusiness" multiple placeholder="请选择特殊业务/荣誉" clearable
            @change="(newValues) => $emit('multi-select-change', 'specialBusiness', newValues)" collapse-tags collapse-tags-tooltip>
            <el-option 
              v-for="option in specialBusinessOptions" 
              :key="option.value" 
              :label="option.label" 
              :value="option.value" 
            />
          </el-select>
          <div class="bp-badge-container" v-if="rateForm.specialBusiness && rateForm.specialBusiness.length > 0">
            <el-tooltip 
              placement="top"
              :content="getSelectedLabels(specialBusinessOptions, rateForm.specialBusiness) +
                        (rateForm.specialBusinessBpLimited ? ' (已达到BP限制)' : '')"
              popper-class="bp-tooltip"
            >
              <span 
                class="bp-badge" 
                :class="{
                  'bp-badge-limited': rateForm.specialBusinessBpLimited,
                  'bp-badge-negative': !rateForm.specialBusinessBpLimited && parseFloat(rateForm.specialBusinessBp) > 0,
                  'bp-badge-positive': !rateForm.specialBusinessBpLimited && parseFloat(rateForm.specialBusinessBp) < 0,
                  'bp-badge-zero': !rateForm.specialBusinessBpLimited && parseFloat(rateForm.specialBusinessBp) === 0
                }"
              >
                BP: {{rateForm.specialBusinessBp}}
                <i v-if="rateForm.specialBusinessBpLimited" class="el-icon-warning-outline" style="margin-left: 2px;"></i>
              </span>
            </el-tooltip>
          </div>
        </div>
      </el-form-item>
      
      <!-- 仅在客户类型为企业时显示的字段 -->
      <template v-if="submitData.customerType === '对公'">
        <el-form-item v-if="shouldShowField('enterpriseScale')" label="企业规模" prop="enterpriseScale" :required="true">
          <div class="input-bp-container">
            <el-select v-model="rateForm.enterpriseScale" placeholder="请选择企业规模" clearable
              @change="(value) => handleSelectChange('enterpriseScale', value, enterpriseScaleOptions, '企业规模')">
              <el-option
                v-for="option in enterpriseScaleOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
            <div class="bp-badge-container" v-if="rateForm.enterpriseScale && rateForm.enterpriseScale !== ''">
              <span 
                class="bp-badge" 
                :class="{
                  'bp-badge-limited': rateForm.enterpriseScaleBpLimited,
                  'bp-badge-negative': !rateForm.enterpriseScaleBpLimited && parseFloat(rateForm.enterpriseScaleBp) > 0,
                  'bp-badge-positive': !rateForm.enterpriseScaleBpLimited && parseFloat(rateForm.enterpriseScaleBp) < 0,
                  'bp-badge-zero': !rateForm.enterpriseScaleBpLimited && parseFloat(rateForm.enterpriseScaleBp) === 0
                }"
              >
                BP: {{rateForm.enterpriseScaleBp}}
                <i v-if="rateForm.enterpriseScaleBpLimited" class="el-icon-warning-outline" style="margin-left: 2px;"></i>
              </span>
            </div>
          </div>
        </el-form-item>

        <el-form-item v-if="shouldShowField('enterpriseRepresentativeBusiness')" label="前6月代发额" prop="enterpriseRepresentativeBusiness" :required="true">
          <div class="input-bp-container">
            <el-input 
              v-model="rateForm.enterpriseRepresentativeBusiness" 
              placeholder="请输入金额" 
              style="width: 90%" 
              @input="validateNumberInput('enterpriseRepresentativeBusiness', '前6月代发额')" 
              @keypress="onlyAllowPositiveNumber($event)"
              clearable
              type="number"
              @mousewheel.native.prevent
              disabled
            />
            <el-tooltip 
              v-if="rateForm.enterpriseRepresentativeBusiness"
              placement="top"
              :content="`当前BP值: ${rateForm.enterpriseRepresentativeBusinessBp}` + 
                       (rateForm.enterpriseRepresentativeBusinessBpLimited ? ' (已达到BP限制)' : '') +
                       getBpLimitText('enterpriseRepresentativeBusiness')"
              popper-class="bp-tooltip"
            >
              <span 
                class="bp-badge"
                :class="{
                  'bp-badge-limited': rateForm.enterpriseRepresentativeBusinessBpLimited,
                  'bp-badge-negative': !rateForm.enterpriseRepresentativeBusinessBpLimited && parseFloat(rateForm.enterpriseRepresentativeBusinessBp) > 0,
                  'bp-badge-positive': !rateForm.enterpriseRepresentativeBusinessBpLimited && parseFloat(rateForm.enterpriseRepresentativeBusinessBp) < 0,
                  'bp-badge-zero': !rateForm.enterpriseRepresentativeBusinessBpLimited && parseFloat(rateForm.enterpriseRepresentativeBusinessBp) === 0
                  }"
              >
                BP:{{rateForm.enterpriseRepresentativeBusinessBp}}
                <i v-if="rateForm.enterpriseRepresentativeBusinessBpLimited" class="el-icon-warning-outline" style="margin-left: 2px;"></i>
              </span>
            </el-tooltip>
          </div>
        </el-form-item>
      </template>
    </el-form>
    
    <!-- 存款信息部分 -->
    <el-divider content-position="left">存款信息</el-divider>
    <el-card class="deposit-info-card">
      <el-form :model="rateForm" label-width="120px" class="deposit-form">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="存款日均">
              <div class="deposit-value-container">
                <el-input 
                  v-model="rateForm.dailyDeposits" 
                  placeholder="" 
                  @input="handleDepositChange('dailyDeposits', '存款日均')"
                  @focus="$emit('refresh-deposit', submitData.custNo)"
                  size="small"
                  clearable 
                  type="number"
                  disabled
                />
                <span class="unit">万元</span>
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="其他日均">
              <div class="deposit-value-container">
                <el-input 
                  v-model="rateForm.otherDeposit" 
                  placeholder="请输入其他日均" 
                  @input="handleDepositChange('otherDeposit', '其他日均')" 
                  size="small"
                  clearable 
                  type="number"
                  min="0"
                  @mousewheel.native.prevent
                />
                <span class="unit">万元</span>
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="存贷比例">
              <div class="deposit-value-container">
                <span class="value highlight">{{rateForm.depositRatio || '0.00'}}</span>
                <span class="unit">%</span>
                <div class="bp-badge-container" v-if="rateForm.depositRatio">
                  <span 
                    class="bp-badge"
                    :class="{
                      'bp-badge-limited': rateForm.depositRatioBpLimited,
                      'bp-badge-negative': !rateForm.depositRatioBpLimited && parseFloat(rateForm.depositRatioBp) > 0,
                      'bp-badge-positive': !rateForm.depositRatioBpLimited && parseFloat(rateForm.depositRatioBp) < 0,
                      'bp-badge-zero': !rateForm.depositRatioBpLimited && parseFloat(rateForm.depositRatioBp) === 0
                    }"
                  >
                    BP: {{ rateForm.depositRatioBp }}
                    <i v-if="rateForm.depositRatioBpLimited" class="el-icon-warning-outline" style="margin-left: 2px;"></i>
                  </span>
                </div>
              </div>
            </el-form-item>
          </el-col>
        </el-row>
        
        <!-- 额外信息展示 - 改为多行布局 -->
        <div class="deposit-info-extra">
          <!-- 存贷区间单独一行 -->
          <div class="deposit-period-row">
            <div class="deposit-period">
              <span class="label">存贷区间:</span>
              <span class="value">{{rateForm.depositPeriod || ''}}</span>
            </div>
          </div>
          
          <!-- 重新设计的基础定价信息显示区域 -->
          <div class="pricing-results-section">
            <!-- 水平排列的基础定价信息 -->
            <div class="pricing-results-row">
              <!-- 最低利率限制提示，放在公式前面 -->
              <div class="rate-limit-inline" v-if="isMinRateLimitReached">
                <span class="rate-limit-text">最低利率限制：{{rateBaseParam.minRate}}%，需要加回 {{additionalBpRequired}} BP</span>
              </div>
              
              <!-- 基础定价计算结果 -->
              <div class="pricing-result-item" v-if="isMinRateLimitReached">
                <span class="pricing-label pricing-calc-label">基础定价计算结果</span>
                <span class="pricing-value pricing-calc-value">{{totalBpValue}}</span>
              </div>
              
              <!-- 连接符号 -->
              <div class="pricing-connector" v-if="isMinRateLimitReached">
                <span class="connector-symbol">+</span>
              </div>
              
              <!-- 最低利率限制调整值 -->
              <div class="pricing-result-item" v-if="isMinRateLimitReached">
                <span class="pricing-label pricing-adjust-label">利率限制调整</span>
                <span class="pricing-value pricing-adjust-value">{{Math.abs(additionalBpRequired)}}</span>
              </div>
              
              <!-- 连接符号 -->
              <div class="pricing-connector" v-if="isMinRateLimitReached">
                <span class="connector-symbol">=</span>
              </div>
              
              <!-- 基础定价最终结果 -->
              <div class="pricing-result-item final-result">
                <span class="pricing-label pricing-final-label">基础定价{{isMinRateLimitReached ? '最终' : ''}}结果</span>
                <span class="pricing-value pricing-final-value">{{finalBasePointValue}}</span>
              </div>
            </div>
          </div>
        </div>
      </el-form>
    </el-card>
    
  </div>
</template>

<script>
import { computed, watch, ref, nextTick } from 'vue';

export default {
  name: 'LoanInfo',
  methods: {
    validate() {
      return this.$refs.rateFormRef && this.$refs.rateFormRef.validate
        ? this.$refs.rateFormRef.validate().catch(err => {
            // 自动聚焦第一个未通过的字段
            if (err && err.fields) {
              const firstField = Object.keys(err.fields)[0];
              nextTick(() => {
                this.$refs.rateFormRef.scrollToField(firstField);
              });
            }
            return Promise.reject(err);
          })
        : Promise.resolve(true);
    },
    // 暴露重新获取客户存款信息方法供父组件调用
    fetchCustDepositInfo(custNo) {
      this.$emit('refresh-deposit', custNo);
    }
  },
  components: {
  },
  props: {
    rateForm: {
      type: Object,
      required: true
    },
    submitData: {
      type: Object,
      required: true
    },
    shouldShowField: {
      type: Function,
      required: true
    },
    loanTermOptions: {
      type: Array,
      default: () => []
    },
    quotaOptions: {
      type: Array,
      default: () => []
    },
    guaranteeTypeOptions: {
      type: Array,
      default: () => []
    },
    borrowerTypeOptions: {
      type: Array,
      default: () => []
    },
    fundingMethodOptions: {
      type: Array,
      default: () => []
    },
    creditNumOptions: {
      type: Array,
      default: () => []
    },
    intermediateServicesOptions: {
      type: Array,
      default: () => []
    },
    landTypeOptions: {
      type: Array,
      default: () => []
    },
    purposeOptions: {
      type: Array,
      default: () => []
    },
    regionOptions: {
      type: Array,
      default: () => []
    },
    creditFactorsOptions: {
      type: Array,
      default: () => []
    },
    repaymentMethodOptions: {
      type: Array,
      default: () => []
    },
    interestFactorsOptions: {
      type: Array,
      default: () => []
    },
    firstLoanFactorsOptions: {
      type: Array,
      default: () => []
    },
    ageOptions: {
      type: Array,
      default: () => []
    },
    industryPropertyOptions: {
      type: Array,
      default: () => []
    },
    loyaltyDegreeOptions: {
      type: Array,
      default: () => []
    },
    wealthBusinessOptions: {
      type: Array,
      default: () => []
    },
    specialBusinessOptions: {
      type: Array,
      default: () => []
    },
    enterpriseScaleOptions: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    rateBaseParam: {
      type: Object,
      default: () => ({
        lprValue: 0,
        minRate: 0,
        basePoint: 0
      })
    },
    rules: {
      type: Object,
      default: () => ({
        credit: [
          { required: true, message: '信用不能为空', trigger: 'blur' },
          { pattern: /^(0|[1-9]\d*)(\.\d{1,2})?$/, message: '请输入大于等于0且最多两位小数的数字', trigger: 'blur' }
        ],
        guarantee: [
          { required: true, message: '保证不能为空', trigger: 'blur' },
          { pattern: /^(0|[1-9]\d*)(\.\d{1,2})?$/, message: '请输入大于等于0且最多两位小数的数字', trigger: 'blur' }
        ],
        collateral: [
          { required: true, message: '抵质押不能为空', trigger: 'blur' },
          { pattern: /^(0|[1-9]\d*)(\.\d{1,2})?$/, message: '请输入大于等于0且最多两位小数的数字', trigger: 'blur' }
        ],
        applyAmount: [
          { required: true, message: '申请金额不能为空', trigger: 'blur' },
          { pattern: /^(?!0(\.0{1,2})?$)(0|[1-9]\d*)(\.\d{1,2})?$/, message: '请输入大于0且最多两位小数的数字', trigger: 'blur' }
        ],
        loanTerm: [
          { required: true, message: '贷款期限不能为空', trigger: 'change' }
        ],
        quota: [
          { 
            required: true, 
            message: '额度定价不能为空', 
            trigger: 'change',
            // 添加条件校验，仅当担保方式为抵押时必填
            validator: (rule, value, callback) => {
              // 获取当前表单引用
              const form = rule.form;
              // 检查担保方式是否为抵押
              if (form && form.guaranteeType === '抵押') {
                if (!value) {
                  callback(new Error('担保方式为抵押时，额度定价不能为空'));
                } else {
                  callback();
                }
              } else {
                // 非抵押担保方式，不做校验
                callback();
              }
            }
          }
        ],
        guaranteeType: [
          { required: true, message: '担保方式不能为空', trigger: 'change' }
        ],
        borrowerType: [
          { required: true, message: '借款人类型不能为空', trigger: 'change' }
        ],
        fundingMethod: [
          { required: true, message: '用款方式不能为空', trigger: 'change' }
        ],
        creditNum: [
          { required: true, message: '融资家数不能为空', trigger: 'change' }
        ],
        landType: [
          { required: true, message: '土地性质不能为空', trigger: 'change' }
        ],
        purpose: [
          { required: true, message: '抵押物属性不能为空', trigger: 'change' }
        ],
        region: [
          { required: true, message: '抵押物属地不能为空', trigger: 'change' }
        ],
        creditFactors: [
          { required: true, message: '征信因素不能为空', trigger: 'change' }
        ],
        repaymentMethod: [
          { required: true, message: '还款方式不能为空', trigger: 'change' }
        ],
        interestFactors: [
          { required: true, message: '还息因素不能为空', trigger: 'change' }
        ],
        firstLoanFactors: [
          { required: true, message: '首贷因素不能为空', trigger: 'change' }
        ],
        age: [
          { required: true, message: '年龄不能为空', trigger: 'change' }
        ],
        industryProperty: [
          { required: true, message: '行业属性不能为空', trigger: 'change' }
        ],
        specialBusiness: [
          { required: true, message: '特殊荣誉不能为空', trigger: 'change' }
        ],
        enterpriseScale: [
          { required: true, message: '企业规模不能为空', trigger: 'change' }
        ],
        enterpriseRepresentativeBusiness: [
          { required: true, message: '前6月代发余额不能为空', trigger: 'blur' },
          { pattern: /^(0|[1-9]\d*)(\.\d{1,2})?$/, message: '请输入大于等于0且最多两位小数的数字', trigger: 'blur' }
        ],
        intermediateServices: [
        ],
        loyaltyDegree: [
        ],
        wealthBusiness: [
          { required: true, message: '财富业务不能为空', trigger: 'change' }
        ]
      })
    }
  },
  emits: ['update:rateForm', 'loan-term-change', 'option-change', 'guaranteeType-change', 'multi-option-change', 'validate-number', 'get-bp-limit-text', 'recalculate-deposit-ratio', 'update:base-point', 'refresh-deposit'],
  setup(props, { emit }) {
    const validateNumberInput = (field, fieldLabel) => {
      emit('validate-number', field, fieldLabel);
    };
    
    const handleLoanTermChange = (value) => {
      emit('loan-term-change', value);
    };
    
    const handleOptionChange = (field, option, fieldLabel) => {
      emit('option-change', field, option, fieldLabel);
    };
    
    const handleGuaranteeTypeChange = (value) => {
      emit('guaranteeType-change', value);
    };
    
    const handleMultiOptionChange = (field, option, label) => {
      emit('multi-option-change', field, option, label);
      
      // 针对多选BP字段，重新计算BP为累加值
      if (field === 'industryProperty') {
        // 确保选择时能获取到正确的BP值
        const selectedOptions = props.industryPropertyOptions.filter(opt => 
          props.rateForm.industryProperty.includes(opt.value)
        );
        if (selectedOptions.length > 0) {
          props.rateForm.industryPropertyBp = selectedOptions.reduce((sum, opt) => 
            sum + (Number(opt.bpValue) || 0), 0
          );
        } else {
          props.rateForm.industryPropertyBp = 0;
        }
      } else if (field === 'loyaltyDegree') {
        // 确保选择时能获取到正确的BP值
        const selectedOptions = props.loyaltyDegreeOptions.filter(opt => 
          props.rateForm.loyaltyDegree.includes(opt.value)
        );
        if (selectedOptions.length > 0) {
          props.rateForm.loyaltyDegreeBp = selectedOptions.reduce((sum, opt) => 
            sum + (Number(opt.bpValue) || 0), 0
          );
        } else {
          props.rateForm.loyaltyDegreeBp = 0;
        }
      } else if (field === 'wealthBusiness') {
        // 确保选择时能获取到正确的BP值
        const selectedOptions = props.wealthBusinessOptions.filter(opt => 
          props.rateForm.wealthBusiness.includes(opt.value)
        );
        if (selectedOptions.length > 0) {
          props.rateForm.wealthBusinessBp = selectedOptions.reduce((sum, opt) => 
            sum + (Number(opt.bpValue) || 0), 0
          );
        } else {
          props.rateForm.wealthBusinessBp = 0;
        }
      } else if (field === 'specialBusiness') {
        // 确保选择时能获取到正确的BP值
        const selectedOptions = props.specialBusinessOptions.filter(opt => 
          props.rateForm.specialBusiness.includes(opt.value)
        );
        if (selectedOptions.length > 0) {
          props.rateForm.specialBusinessBp = selectedOptions.reduce((sum, opt) => 
            sum + (Number(opt.bpValue) || 0), 0
          );
        } else {
          props.rateForm.specialBusinessBp = 0;
        }
      } else if (field === 'intermediateServices') {
        // 确保选择时能获取到正确的BP值
        const selectedOptions = props.intermediateServicesOptions.filter(opt => 
          props.rateForm.intermediateServices.includes(opt.value)
        );
        if (selectedOptions.length > 0) {
          props.rateForm.intermediateServicesBp = selectedOptions.reduce((sum, opt) => 
            sum + (Number(opt.bpValue) || 0), 0
          );
        } else {
          props.rateForm.intermediateServicesBp = 0;
        }
      }
    };
    
    const getSelectedLabels = (options, selectedValues) => {
      if (!options || !selectedValues || !selectedValues.length) return '';
      
      return selectedValues.map(value => {
        const option = options.find(opt => opt.value === value);
        return option ? option.label : value;
      }).join('、');
    };
    
    const getBpLimitText = (field) => {
      emit('get-bp-limit-text', field);
      return '';
    };

    // 处理存款信息变化
    const handleDepositChange = (field, fieldLabel) => {
      // 先验证数字输入
      validateNumberInput(field, fieldLabel);
      // 等待数据更新，稍后重新计算存贷比例
      setTimeout(() => {
        recalculateDepositRatio();
      }, 300);
    }
    
    const recalculateDepositRatio = () => {
      emit('recalculate-deposit-ratio');
    }
    
    // BP字段定义
    const bpFields = [
      { label: '贷款期限', bpField: 'loanTermBp' },
      { label: '额度定价', bpField: 'quotaBp' },
      { label: '担保方式', bpField: 'guaranteeTypeBp' },
      { label: '借款人类型', bpField: 'borrowerTypeBp' },
      { label: '用款方式', bpField: 'fundingMethodBp' },
      { label: '融资家数', bpField: 'creditNumBp' },
      { label: '粘性指标', bpField: 'intermediateServicesBp' },
      { label: '土地性质', bpField: 'landTypeBp' },
      { label: '抵押物属性', bpField: 'purposeBp' },
      { label: '抵押物属地', bpField: 'regionBp' },
      { label: '征信因素', bpField: 'creditFactorsBp' },
      { label: '还款方式', bpField: 'repaymentMethodBp' },
      { label: '还息因素', bpField: 'interestFactorsBp' },
      { label: '首贷因素', bpField: 'firstLoanFactorsBp' },
      { label: '年龄', bpField: 'ageBp' },
      { label: '行业属性', bpField: 'industryPropertyBp' },
      { label: '忠诚度', bpField: 'loyaltyDegreeBp' },
      { label: '财富业务', bpField: 'wealthBusinessBp' },
      { label: '特殊荣誉', bpField: 'specialBusinessBp' },
      { label: '企业规模', bpField: 'enterpriseScaleBp' },
      { label: '前6月代发余额', bpField: 'enterpriseRepresentativeBusinessBp' }
    ];
    
    // 计算总BP值
    const totalBpValue = computed(() => {
      // 计算贷款相关字段的BP总和
      let total = bpFields.reduce((sum, field) => {
        if (field && field.bpField && props.rateForm[field.bpField]) {
          return sum + (Number(props.rateForm[field.bpField]) || 0);
        }
        return sum;
      }, 0);
      
      // 添加存贷比例BP值到总计中
      const depositRatioBp = Number(props.rateForm.depositRatioBp) || 0;
      total += depositRatioBp;
      
      // 添加基础加点BP值到总计中
      const baseBp = Number(props.rateForm.basePointBp) || 0;
      total += baseBp;
      
      return total;
    });
    
    // 检查是否达到最低利率限制
    const isMinRateLimitReached = computed(() => {
      const lprValue = parseFloat(props.rateBaseParam?.lprValue || 0);
      const minRate = parseFloat(props.rateBaseParam?.minRate || 0);
      const basePointValue = parseFloat(totalBpValue.value || 0);
      
      // 显示条件：最低利率*100 - LPR值*100 + 基础定价加点 < 0
      const calculation = minRate * 100 - lprValue * 100 - basePointValue;
      
      return calculation > 0;
    });
    
    // 计算需要加回的BP值
    const additionalBpRequired = computed(() => {
      const lprValue = parseFloat(props.rateBaseParam?.lprValue || 0);
      const minRate = parseFloat(props.rateBaseParam?.minRate || 0);
      const basePointValue = parseFloat(totalBpValue.value || 0);
      
      // 计算公式：最低利率*100 - LPR值*100 - 基础定价加点
      const result = (minRate * 100 - lprValue * 100 - basePointValue);
      return result;
    });
    
    // 计算基础定价最终结果
    const finalBasePointValue = computed(() => {
      const baseBP = parseFloat(totalBpValue.value || 0);
      
      // 如果需要加回BP值（最低利率限制触发），则加上additionalBpRequired
      if (isMinRateLimitReached.value) {
        const additionalBP = parseFloat(additionalBpRequired.value || 0);
        const finalValue = baseBP + additionalBP;
        return finalValue;
      } else {
        // 否则返回原始基础定价结果
        return baseBP;
      }
    });
    
    // 监听finalBasePointValue的变化，通知父组件
    watch(finalBasePointValue, (newValue) => {
      emit('update:base-point', newValue);
    }, { immediate: true });
    
    // 根据筛选计算哪些字段应该显示
    const filteredFields = computed(() => {
      return FIELD_GROUPS.filter(group => props.shouldShowField(group.fieldName));
    });

    // 多选BP取最小值工具函数（增强日志和类型兼容性）
    const calcMultiSelectMinBp = (options, selected) => {
      if (!selected || selected.length === 0) return 0;
      const bps = selected
        .map(val => {
          // 用字符串比较，防止类型不一致
          const opt = options.find(o => String(o.value) === String(val));
          return opt && !isNaN(Number(opt.bpValue)) ? Number(opt.bpValue) : null;
        })
        .filter(bpValue => bpValue !== null);
      return bps.length > 0 ? Math.min(...bps) : 0;
    };

    const rateFormRef = ref(null);

    const onlyAllowPositiveNumber = (e) => {
      const char = String.fromCharCode(e.keyCode || e.which);
      // 只允许输入数字和小数点，禁止负号
      if (!/[0-9.]/.test(char)) {
        e.preventDefault();
      }
      // 禁止第一个字符为小数点
      if (e.target.value === '' && char === '.') {
        e.preventDefault();
      }
      // 禁止输入多个小数点
      if (char === '.' && e.target.value.includes('.')) {
        e.preventDefault();
      }
    };

    /**
     * 统一处理单选下拉框的change事件
     * @param {string} field - 字段名, e.g., 'loanTerm'
     * @param {string} value - 选中的值
     * @param {Array} options - 选项列表, e.g., loanTermOptions
     * @param {string} fieldLabel - 字段中文名, e.g., '贷款期限'
     */
    const handleSelectChange = (field, value, options, fieldLabel) => {
      // 找到完整的option对象
      const selectedOption = options.find(opt => opt.value === value);
      
      // 触发统一的option-change事件
      emit('option-change', field, selectedOption, fieldLabel);

      // 特殊处理担保方式的change事件
      if (field === 'guaranteeType') {
        emit('guaranteeType-change', value);
      }

      // 特殊处理担保方式的change事件
      if (field === 'loanTerm') {
        emit('loan-term-change', value);
      }
    };

    // 计算身份证年龄
    const idCardAge = computed(() => {
      const customerNo = props.submitData.customerNo;
      
      // 检查身份证号码是否为18位
      if (!customerNo || customerNo.length !== 21) {
        return null;
      }
      
      try {
        // 提取出生日期 (第7-14位是YYYYMMDD)
        const birthYear = parseInt(customerNo.substring(9, 13));
        const birthMonth = parseInt(customerNo.substring(13, 15));
        const birthDay = parseInt(customerNo.substring(15, 17));
        
        // 计算年龄
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth() + 1;
        const currentDay = today.getDate();
        
        let age = currentYear - birthYear;
        
        // 如果还没到生日，年龄减1
        if (currentMonth < birthMonth || (currentMonth === birthMonth && currentDay < birthDay)) {
          age--;
        }
        
        return age;
      } catch (error) {
        console.warn('解析身份证年龄失败:', error);
        return null;
      }
    });

    return {
      validateNumberInput,
      handleLoanTermChange,
      handleOptionChange,
      handleGuaranteeTypeChange,
      handleMultiOptionChange,
      getSelectedLabels,
      getBpLimitText,
      handleDepositChange,
      recalculateDepositRatio,
      bpFields,
      totalBpValue,
      isMinRateLimitReached,
      additionalBpRequired,
      finalBasePointValue,
      filteredFields,
      calcMultiSelectMinBp,
      rateFormRef,
      onlyAllowPositiveNumber,
      handleSelectChange,
      idCardAge
    };
  }
}
</script>

<style lang="scss" scoped>
.rate-form {
  margin-top: 15px;
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 每行3列 */
  gap: 15px;
}

/* 移除1600px的媒体查询，默认就是3列 */

/* 为小屏幕增加媒体查询，在小屏幕下降为2列 */
@media (max-width: 1400px) {
  .rate-form {
    grid-template-columns: repeat(2, 1fr); /* 小屏幕时2列 */
  }
}

@media (max-width: 768px) {
  .rate-form {
    grid-template-columns: repeat(1, 1fr); /* 移动设备时1列 */
  }
}

.input-bp-container {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  height: 32px;
  
  .bp-badge {
    margin-left: 8px;
    background-color: #409EFF;
    color: white;
    font-size: 12px;
    padding: 2px 6px;
    border-radius: 4px;
    white-space: nowrap;
    display: inline-flex;
    align-items: center;
    height: 20px;
    line-height: 1;
  }
}

:deep(.el-select) {
  width: 90%;
  height: 32px;
}

.el-divider {
  margin: 10px 0;
}

.el-divider__text {
  font-size: 14px;
  font-weight: bold;
  color: #409eff;
}

.bp-summary-container {
  margin-top: 30px;
}

.bp-summary-card {
  margin: 20px 0;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  background-color: #f8f8f8;
}

.bp-summary-content {
  display: flex;
  flex-direction: column;
  padding: 10px;
}

.bp-field-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 15px;
}

@media (max-width: 1400px) {
  .bp-field-list {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .bp-field-list {
    grid-template-columns: repeat(1, 1fr);
  }
}

.bp-field-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 5px 10px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.bp-field-label {
  font-size: 13px;
  color: #606266;
}

.bp-badge-container {
  margin-left: 8px;
  min-width: 80px; /* 确保BP值显示有足够空间 */
  display: flex;
  align-items: center;
  gap: 8px;
  
  .age-info {
    font-size: 12px;
    color: #1357dd;
    white-space: nowrap;
    margin-right: 4px;
  }
  
  .bp-badge {
    background-color: #409EFF;
    color: white;
    font-size: 12px;
    padding: 2px 6px;
    border-radius: 4px;
    white-space: nowrap !important; /* 强制不换行 */
    display: inline-flex;
    align-items: center;
    height: 20px;
    line-height: 1;
    
    &.bp-badge-limited {
      background-color: #E6A23C !important; // 橙色，优先生效
    }
    
    &.bp-badge-positive {
      background-color: #67C23A !important; // 绿色
    }
    
    &.bp-badge-negative {
      background-color: #F56C6C !important; // 红色
    }
    
    &.bp-badge-zero {
      background-color: #909399 !important; // 灰色
    }
  }
}

/* 存款信息样式 */
.deposit-info-card {
  margin: 20px 0;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  background-color: #f8f8f8;
  
  :deep(.el-card__body) {
    padding: 15px;
  }
  
  .deposit-form {
    background-color: transparent;
    padding: 0;
    
    .el-form-item {
      margin-bottom: 0;
    }
  }
  
  .deposit-value-container {
    display: flex;
    align-items: center;
    gap: 8px;
    
    .value {
      font-size: 16px;
      font-weight: bold;
      color: #303133;
      min-width: 60px;
    }
    
    .highlight {
      color: #d81e06;
    }
    
    .unit {
      font-size: 12px;
      color: #606266;
      white-space: nowrap;
    }
    
    :deep(.el-input) {
      width: 120px;
    }
  }
}

/* 修改存款信息行的布局 */
:deep(.el-row) {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 32px;
  margin: 0 !important;
  padding: 10px 0;
}

:deep(.el-col) {
  flex: 0 0 auto;
  width: auto !important;
  max-width: none;
  padding: 0 !important;
}

:deep(.el-form-item__content) {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 0 !important;
}

:deep(.el-form-item__label) {
  font-size: 14px;
  font-weight: bold;
  padding-right: 12px;
  line-height: 32px;
  height: 32px;
}

/* BP标签样式优化 */
.bp-badge {
  background-color: #409EFF;
  color: #fff;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  height: 20px;
  line-height: 1;
  &.bp-badge-limited {
    background-color: #E6A23C !important; // 橙色，优先生效
  }
  &.bp-badge-positive {
    background-color: #67C23A !important; // 绿色
  }
  &.bp-badge-negative {
    background-color: #F56C6C !important; // 红色
  }
  &.bp-badge-zero {
    background-color: #909399 !important; // 灰色
  }
}

/* 额外信息展示 - 改为多行布局 */
.deposit-info-extra {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed #dcdfe6;
  display: flex;
  flex-direction: column; /* 改为纵向排列 */
  
  /* 存贷区间行样式 */
  .deposit-period-row {
    width: 100%;
    margin-bottom: 15px;
  }
  
  .deposit-period {
    font-size: 13px;
    color: #606266;
    white-space: nowrap;
    display: inline-block; /* 改为内联块，确保一行显示 */
    
    .label {
      margin-right: 5px;
      font-weight: 500;
    }
    
    .value {
      color: #409EFF;
      font-weight: 500;
    }
  }
  
  /* 保留原有布局样式 */
  .bp-total {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    
    .bp-total-label {
      font-size: 14px;
      font-weight: bold;
      color: #303133;
      margin-right: 10px;
    }
  }
}

/* 重新设计的基础定价信息显示区域 */
.pricing-results-section {
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-top: 10px;
}

/* 水平排列的基础定价信息 */
.pricing-results-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  margin-top: 15px;
  width: 100%;
}

/* 每个结果项样式 */
.pricing-result-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-left: 20px;
  padding: 8px 12px;
  border-radius: 4px;
  background-color: #f5f7fa;
}

/* 标签样式 */
.pricing-label {
  font-size: 13px;
  font-weight: 500;
  color: #606266;
  margin-bottom: 5px;
}

/* 值样式基础 */
.pricing-value {
  font-size: 16px;
  font-weight: 700;
  border-radius: 3px;
  padding: 2px 8px;
}

/* 计算结果值样式 */
.pricing-calc-value {
  color: white;
  background-color: #F56C6C;
}

/* 调整值样式 */
.pricing-adjust-value {
  color: white;
  background-color: #E6A23C;
}

/* 最终值样式 */
.pricing-final-value {
  color: white;
  background-color: #67C23A;
}

/* 连接符号容器 */
.pricing-connector {
  display: flex;
  align-items: center;
  margin: 0 5px;
}

/* 连接符号 */
.connector-symbol {
  font-size: 22px;
  font-weight: bold;
  color: #909399;
}

/* 最终结果项样式 */
.final-result {
  background-color: #e1f3d8;
  border: 1px solid #67C23A;
}

/* 最终结果标签和值 */
.final-result .pricing-label {
  font-weight: 600;
}

.final-result .pricing-value {
  font-size: 18px;
  padding: 3px 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 基础定价计算结果标签样式 */
.pricing-calc-label {
  font-size: 13px;
  font-weight: 500;
  color: #606266;
  margin-bottom: 5px;
}

/* 利率限制调整标签样式 */
.pricing-adjust-label {
  font-size: 13px;
  font-weight: 500;
  color: #606266;
  margin-bottom: 5px;
}

/* 基础定价最终结果标签样式 */
.pricing-final-label {
  font-size: 13px;
  font-weight: 500;
  color: #606266;
  margin-bottom: 5px;
}

/* 最低利率限制内联提示样式 */
.rate-limit-inline {
  display: flex;
  align-items: center;
  margin-right: 15px;
}

.rate-limit-text {
  color: #F56C6C;
  font-size: 13px;
  font-weight: 500;
}
</style> 